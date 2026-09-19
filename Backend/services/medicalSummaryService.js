const Groq = require("groq-sdk");

// Groq model ids move faster than this repo does, so it stays overridable.
// The default must be one that supports json_schema structured outputs.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const REQUEST_TIMEOUT_MS = 60000;

// Echoed verbatim by the model and rendered visibly in the UI.
const DISCLAIMER =
  "AI-generated from records on file. Not a clinical assessment. Verify against the source record before acting.";

/*
 * Hard rules. The audience is a doctor, so the danger here is not rudeness -
 * it is a confident sentence that no record supports. Every rule below exists
 * to keep the model inside the supplied JSON.
 */
const SYSTEM_INSTRUCTION = `You summarise an existing medical record for a licensed physician who is about to see the patient.

ROLE AND BOUNDARY
- Your reader is a clinician, not the patient. Never address the patient.
- You recap the record and flag things worth attention. You do NOT diagnose, do NOT suggest treatments or drugs, do NOT change dosages, and do NOT comment on prognosis.

GROUNDING - THESE ARE THE RULES THAT MATTER MOST
- Use ONLY the JSON supplied in the user message. It is the entire world of facts available to you.
- Never introduce a condition, medicine, allergy, vital sign, or lab value that is not present in that JSON.
- If something is not in the data, write exactly "not recorded". Never infer it, never estimate it, and never fill the gap from general medical knowledge.
- Every clinical statement must be traceable to a specific record, and must carry that record's date.
- Report contents were NOT analysed. You have only titles, types and dates. Never state or imply a lab value, a finding, or a result.
- Medicines are always described as "as last prescribed on <date>", never as "currently taking" - the database holds no adherence or dispensing data.

pointsOfAttention - ALLOW-LIST
You may raise ONLY these kinds of observation:
- the same complaint recurring across multiple visits (give the dates)
- a followUpDate that has passed with no later appointment on record
- a prescription with no follow-up recorded
- past emergency events
- a long gap in care, or a run of SKIPPED / CANCELLED appointments
- the same medicine re-prescribed repeatedly over a long span
You may NOT name a suspected diagnosis, recommend a drug, recommend a test, or judge another doctor's decision. If nothing in the allow-list applies, return an empty array.

STYLE
- Telegraphic clinical register. 250 words of prose maximum across the whole response.
- Plain text strings only. No markdown, no asterisks, no bullet characters.
- Dates as DD-MM-YYYY.
- If the record holds fewer than two entries in total, set insufficientRecord to true, keep every section minimal, and do not pad.
- Set disclaimer to exactly: "${DISCLAIMER}"`;

/*
 * Plain JSON Schema for Groq structured outputs. Strict mode requires every
 * property to appear in `required` and every object to set
 * additionalProperties: false - a missing one is rejected by the API rather
 * than silently ignored.
 */
const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    insufficientRecord: {
      type: "boolean",
      description: "True when there are fewer than two records in total.",
    },
    patientSnapshot: {
      type: "string",
      description:
        'One or two lines: age, gender, blood group. Use "not recorded" for anything absent.',
    },
    visitTimeline: {
      type: "array",
      description: "Most recent first, at most 10 entries.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: "string" },
          detail: { type: "string" },
        },
        required: ["date", "detail"],
      },
    },
    activeMedications: {
      type: "array",
      description:
        "Medicines from the most recent prescription only. Copy each value verbatim from the record. Never merge fields and never add narration.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: {
            type: "string",
            description: 'Drug name only, e.g. "Amlodipine".',
          },
          dosage: {
            type: "string",
            description: 'Strength only, e.g. "5mg". "not recorded" if absent.',
          },
          frequency: {
            type: "string",
            description:
              'Frequency code only, e.g. "OD", "BD", "TDS". "not recorded" if absent.',
          },
          duration: {
            type: "string",
            description:
              'Duration only, e.g. "30 days". "not recorded" if absent.',
          },
          instructions: {
            type: "string",
            description:
              'Instruction only, e.g. "After food". "not recorded" if absent.',
          },
          lastPrescribedOn: {
            type: "string",
            description: "Date of that prescription, DD-MM-YYYY. Nothing else.",
          },
        },
        required: [
          "name",
          "dosage",
          "frequency",
          "duration",
          "instructions",
          "lastPrescribedOn",
        ],
      },
    },
    recurringPatterns: {
      type: "array",
      description:
        "Complaints or diagnoses appearing more than once, with counts and date ranges.",
      items: { type: "string" },
    },
    reportsOnFile: {
      type: "array",
      description: "Title, type and date only. Contents were not analysed.",
      items: { type: "string" },
    },
    pointsOfAttention: {
      type: "array",
      description: "At most 5. Allow-list only. Empty array if none apply.",
      items: { type: "string" },
    },
    dataGaps: {
      type: "array",
      description:
        "What was unavailable, so the doctor knows what this summary could not cover.",
      items: { type: "string" },
    },
    disclaimer: { type: "string" },
  },
  required: [
    "insufficientRecord",
    "patientSnapshot",
    "visitTimeline",
    "activeMedications",
    "recurringPatterns",
    "reportsOnFile",
    "pointsOfAttention",
    "dataGaps",
    "disclaimer",
  ],
};

/*
 * Carries the upstream HTTP status so the controller can tell a quota trip
 * (429) apart from a genuine failure, instead of flattening both to 500 the
 * way medicineAnalysisService does.
 */
class MedicalSummaryError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "MedicalSummaryError";
    this.status = status;
  }
}

let client = null;

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new MedicalSummaryError(
      "GROQ_API_KEY is not configured on the server",
      503
    );
  }

  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  return client;
};

const generateMedicalSummary = async (summaryInput) => {
  const groq = getClient();

  let response;

  try {
    response = await groq.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          {
            role: "user",
            content: `Summarise this patient record.\n\n${JSON.stringify(
              summaryInput
            )}`,
          },
        ],
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "medical_summary",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      },
      {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        // The controller surfaces 429 to the caller as its own message, so
        // retrying a rate limit inside a 60s budget just burns the window.
        maxRetries: 0,
      }
    );
  } catch (error) {
    const status = error?.status || error?.response?.status;

    if (
      error?.name === "TimeoutError" ||
      error?.name === "AbortError" ||
      error instanceof Groq.APIConnectionTimeoutError
    ) {
      throw new MedicalSummaryError("Summary generation timed out", 504);
    }

    console.error("Groq summary error:", status, error?.message);

    throw new MedicalSummaryError(
      status === 429
        ? "Summary service is rate limited, try again in a moment"
        : `Summary generation failed: ${error?.message || "unknown error"}`,
      status || 502
    );
  }

  const text = response?.choices?.[0]?.message?.content;

  if (!text) {
    throw new MedicalSummaryError(
      "Summary service returned an empty response",
      502
    );
  }

  let summary;

  try {
    summary = JSON.parse(text);
  } catch {
    throw new MedicalSummaryError("Summary service returned invalid JSON", 502);
  }

  // response_format makes this unlikely, but a missing section would render as
  // a blank card in the UI, so fail loudly instead.
  if (!summary || typeof summary.patientSnapshot !== "string") {
    throw new MedicalSummaryError(
      "Summary service returned an unexpected shape",
      502
    );
  }

  // The disclaimer is not the model's to reword.
  summary.disclaimer = DISCLAIMER;

  return summary;
};

module.exports = { generateMedicalSummary, MedicalSummaryError, DISCLAIMER };
