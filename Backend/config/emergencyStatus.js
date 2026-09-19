// Single source of truth for how an emergency request moves through its
// lifecycle. Previously the "what counts as active" list lived in
// patientController and the transition table inside hospitalController's
// updateEmergencyStatus, with no link between them; the hospital-facing list
// endpoint became the third consumer, so they live here instead.
//
// The enum itself still belongs to models/EmergencyModel.js - this file only
// describes movement between those values.

// Ongoing: created and not yet finished or called off. Drives the duplicate
// guard in createEmergency, the patient's own active lookup, and the
// active-first ordering of the hospital queue.
const ACTIVE_EMERGENCY_STATUSES = [
  "REQUESTED",
  "ACKNOWLEDGED",
  "AMBULANCE_ASSIGNED",
  "ON_THE_WAY",
  "ARRIVED",
  "PATIENT_PICKED",
];

// How far a patient may call their own request off. Once the ambulance has
// ARRIVED the crew is on scene, so standing it down is a conversation with the
// hospital rather than a button - those states are left to the hospital's own
// status endpoint.
const CANCELLABLE_EMERGENCY_STATUSES = [
  "REQUESTED",
  "ACKNOWLEDGED",
  "AMBULANCE_ASSIGNED",
  "ON_THE_WAY",
];

// Strictly linear, one step at a time - the hospital cannot skip ahead. Both
// terminal states are dead ends: COMPLETED is the end of the flow, and
// CANCELLED is the patient's own exit, which the hospital may not revive.
const EMERGENCY_TRANSITIONS = {
  REQUESTED: ["ACKNOWLEDGED"],
  ACKNOWLEDGED: ["AMBULANCE_ASSIGNED"],
  AMBULANCE_ASSIGNED: ["ON_THE_WAY"],
  ON_THE_WAY: ["ARRIVED"],
  ARRIVED: ["PATIENT_PICKED"],
  PATIENT_PICKED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

module.exports = {
  ACTIVE_EMERGENCY_STATUSES,
  CANCELLABLE_EMERGENCY_STATUSES,
  EMERGENCY_TRANSITIONS,
};
