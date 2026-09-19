
console.log("🔥 PatientAIAssistant FILE LOADED");
import React, { useEffect, useRef, useState } from "react";

const API_BASE_URL = "https://medical-voice-agent.onrender.com" ;
const API_URL = `${API_BASE_URL}/api/chat/voice`;
console.log("🔥 API BASE URL:", API_BASE_URL);
console.log(`base url is: ${API_BASE_URL}`);

const PATIENT_ID_KEY = "medireach_patient_id";
const SESSION_ID_KEY = "medireach_session_id";

const DEFAULT_PATIENT_ID = "3";

const getOrCreateStoredId = (key, prefix, defaultValue = null) => {
  let value = localStorage.getItem(key);

  if (!value) {
    value = defaultValue || `${prefix}-${crypto.randomUUID()}`;
    localStorage.setItem(key, value);
  }

  return value;
};

const PatientAIAssistant = () => {
  const [conversationActive, setConversationActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready to start");
  const [statusType, setStatusType] = useState("ready");
  const [messages, setMessages] = useState([]);
  const [debugLogs, setDebugLogs] = useState([]);
  const [testingBackend, setTestingBackend] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);

  // 🔑 THE FIX: keep a ref that always holds the *current* value of
  // conversationActive. React state updates are async/batched, so any
  // async callback chain (recorder.onstop -> sendAudio -> playAIResponse
  // -> audio.onended) that was created in the same tick as
  // setConversationActive(true) would otherwise still see the OLD value
  // via closure. Refs update synchronously, so this fixes it.
  const conversationActiveRef = useRef(false);

  const patientIdRef = useRef(
    getOrCreateStoredId(PATIENT_ID_KEY, "patient", DEFAULT_PATIENT_ID)
  );

  const sessionIdRef = useRef(
    getOrCreateStoredId(SESSION_ID_KEY, "session")
  );

  const setConversationActiveBoth = (value) => {
    conversationActiveRef.current = value;
    setConversationActive(value);
  };

  // Mirrors every important event into an on-screen panel, so debugging
  // doesn't require opening browser DevTools.
  const addLog = (message, level = "info") => {
    const time = new Date().toLocaleTimeString();

    if (level === "error") {
      console.error(message);
    } else if (level === "warn") {
      console.warn(message);
    } else {
      console.log(message);
    }

    setDebugLogs((prev) => [
      ...prev.slice(-49),
      { id: crypto.randomUUID(), time, message: String(message), level },
    ]);
  };

  const testBackendConnection = async () => {
    setTestingBackend(true);

    addLog(`Testing connection to ${API_BASE_URL} ...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(API_BASE_URL, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      addLog(
        `Backend reachable. Status: ${response.status} ${response.statusText}`
      );
    } catch (error) {
      if (error.name === "AbortError") {
        addLog(
          "Timed out after 15s — backend may be asleep (Render free tier) or unreachable.",
          "error"
        );
      } else if (error instanceof TypeError) {
        addLog(
          `Network/CORS error: "${error.message}". Backend is likely blocking this origin (${window.location.origin}) in its CORS config, or the backend is down.`,
          "error"
        );
      } else {
        addLog(`Unexpected error: ${error.message}`, "error");
      }
    } finally {
      setTestingBackend(false);
    }
  };

  const setAssistantStatus = (message, type = "ready") => {
    setStatus(message);
    setStatusType(type);
  };

  const addMessage = (type, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        text,
      },
    ]);
  };

  const startConversation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      // Update ref synchronously *and* trigger the state update for UI.
      setConversationActiveBoth(true);

      setAssistantStatus("Listening... Speak now", "listening");

      startRecording(stream);
    } catch (error) {
      addLog(`getUserMedia failed: ${error.name} - ${error.message}`, "error");

      setAssistantStatus("Microphone permission denied", "error");

      alert("Please allow microphone permission to use the AI Assistant.");
    }
  };

  const startRecording = (stream = streamRef.current) => {
    if (!conversationActiveRef.current) {
      return;
    }

    if (!stream) {
      return;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      return;
    }

    audioChunksRef.current = [];

    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      addLog(`recorder.onstop fired. chunks: ${audioChunksRef.current.length}`);

      setIsRecording(false);

      const audioBlob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType,
      });

      await sendAudio(audioBlob);
    };

    recorder.start();

    setIsRecording(true);

    setAssistantStatus("Listening... Speak now", "listening");
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();

      setIsRecording(false);

      setAssistantStatus("Processing your request...", "processing");
    }
  };

  const sendAudio = async (audioBlob) => {
    addLog(
      `sendAudio called. blob size: ${audioBlob.size} bytes, conversationActive: ${conversationActiveRef.current}`
    );

    // ✅ check the ref, not the state variable
    if (!conversationActiveRef.current) {
      addLog("sendAudio bailed early: conversation not active", "warn");
      return;
    }

    if (audioBlob.size === 0) {
      addLog("sendAudio bailed early: empty audio blob (stopped too fast?)", "warn");
      setAssistantStatus("Didn't catch that, try again", "error");
      return;
    }

    // A dead/sleeping backend should not hang the UI forever. Render's
    // free tier can take 30-60s to wake up on the first request; beyond
    // that, something else is wrong, so give up and surface an error.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      setAssistantStatus("AI is thinking...", "processing");

      const formData = new FormData();

      formData.append("patient_id", patientIdRef.current);
      formData.append("session_id", sessionIdRef.current);
      formData.append("file", audioBlob, "speech.webm");

      addLog(`Sending request to: ${API_URL}`);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      addLog(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      addLog(`API response received. transcript: ${!!data.transcript}, response: ${!!data.response}, audio: ${!!data.audio}`);

      if (data.transcript) {
        addMessage("user", data.transcript);
      }

      if (data.response) {
        addMessage("assistant", data.response);
      }

      if (!data.audio) {
        throw new Error("No audio returned by backend");
      }

      await playAIResponse(data.audio);
    } catch (error) {
      clearTimeout(timeoutId);

      let message = "Something went wrong. Please try again.";

      if (error.name === "AbortError") {
        message = "Server took too long to respond. It may be waking up — try again in a moment.";
        addLog("Request aborted after 60s timeout (backend not responding).", "error");
      } else if (error instanceof TypeError) {
        // fetch() throws a plain TypeError for network/CORS failures,
        // with no useful HTTP status attached.
        message = "Can't reach the server (network or CORS issue).";
        addLog(
          `Network/CORS error: "${error.message}". Check backend CORS config allows origin ${window.location.origin}.`,
          "error"
        );
      } else {
        addLog(`Voice error: ${error.message}`, "error");
      }

      setAssistantStatus(message, "error");

      if (conversationActiveRef.current) {
        setTimeout(() => {
          if (conversationActiveRef.current) {
            startRecording();
          }
        }, 1000);
      }
    }
  };

  const playAIResponse = async (base64Audio) => {
    return new Promise(async (resolve, reject) => {
      try {
        setAssistantStatus("MediReach AI is speaking...", "speaking");

        const byteCharacters = atob(base64Audio);

        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        const audioBlob = new Blob([byteArray], {
          type: "audio/mpeg",
        });

        const audioURL = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioURL);

        currentAudioRef.current = audio;

        audio.preload = "auto";

        audio.onended = () => {
          URL.revokeObjectURL(audioURL);

          currentAudioRef.current = null;

          resolve();

          // ✅ check the ref, not the state variable
          if (conversationActiveRef.current) {
            setTimeout(() => {
              if (conversationActiveRef.current) {
                startRecording();
              }
            }, 300);
          }
        };

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioURL);

          currentAudioRef.current = null;

          reject(error);
        };

        await audio.play();
      } catch (error) {
        reject(error);
      }
    });
  };

  const endConversation = () => {
    setConversationActiveBoth(false);
    setIsRecording(false);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    }

    mediaRecorderRef.current = null;

    setAssistantStatus("Conversation ended", "ready");
  };

  useEffect(() => {
    addLog(`App origin: ${window.location.origin}`);
    addLog(`Resolved API_BASE_URL: ${API_BASE_URL}`);
    addLog(`Patient ID: ${patientIdRef.current}`);
    addLog(`Session ID: ${sessionIdRef.current}`);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-6 md:px-8">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
                <span className="text-xl">✚</span>
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  MediReach
                </h1>

                <p className="text-xs text-slate-400">
                  Patient AI Assistant
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                conversationActive
                  ? "animate-pulse bg-emerald-400"
                  : "bg-slate-500"
              }`}
            />

            <span className="text-sm text-slate-300">
              {conversationActive ? "Assistant Active" : "Assistant Offline"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* LEFT PANEL */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
            <div className="text-center">
              <p className="mb-2 text-sm font-medium text-cyan-400">
                AI HEALTH ASSISTANT
              </p>

              <h2 className="text-2xl font-bold">How can I help you?</h2>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-400">
                Talk naturally with MediReach AI about your healthcare
                questions.
              </p>
            </div>

            {/* Voice Orb */}
            <div className="my-10 flex justify-center">
              <button
                onClick={
                  conversationActive ? stopRecording : startConversation
                }
                className={`group relative flex h-36 w-36 items-center justify-center rounded-full transition-all duration-300 ${
                  conversationActive
                    ? "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_70px_rgba(34,211,238,0.3)]"
                    : "bg-gradient-to-br from-slate-800 to-slate-900 shadow-[0_0_50px_rgba(59,130,246,0.12)]"
                }`}
              >
                {conversationActive && (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full border border-cyan-400/30" />

                    <span className="absolute -inset-4 rounded-full border border-cyan-400/10" />
                  </>
                )}

                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                  <span className="text-4xl">
                    {isRecording ? "🎙️" : "🎤"}
                  </span>
                </div>
              </button>
            </div>

            {/* Status */}
            <div className="mb-6">
              <div
                className={`rounded-2xl border px-4 py-3 text-center text-sm ${
                  statusType === "listening"
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    : statusType === "processing"
                    ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
                    : statusType === "speaking"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : statusType === "error"
                    ? "border-red-400/20 bg-red-400/10 text-red-300"
                    : "border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                <div className="mb-1 font-semibold">{status}</div>

                {statusType === "listening" && (
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <span
                        key={item}
                        className="h-1 w-1.5 animate-pulse rounded-full bg-current"
                        style={{
                          animationDelay: `${item * 100}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startConversation}
                disabled={conversationActive}
                className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                🎤 Start
              </button>

              <button
                onClick={stopRecording}
                disabled={!conversationActive || !isRecording}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ⏹ Stop
              </button>

              <button
                onClick={endConversation}
                disabled={!conversationActive}
                className="col-span-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                🛑 End Conversation
              </button>
            </div>

            {/* Privacy */}
            <div className="mt-6 rounded-2xl border border-white/5 bg-black/10 p-4">
              <div className="flex gap-3">
                <span className="text-lg">🔒</span>

                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Voice Assistant
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Allow microphone access when your browser asks for
                    permission.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex min-h-[650px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
            {/* Chat Header */}
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
                    🤖
                  </div>

                  <div>
                    <h3 className="font-semibold">MediReach AI</h3>

                    <p className="text-xs text-slate-500">
                      Your healthcare companion
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  AI Online
                </span>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[500px] items-center justify-center">
                  <div className="max-w-md text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl">
                      🩺
                    </div>

                    <h3 className="text-lg font-semibold">
                      Start a conversation
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Press the microphone button and tell MediReach what
                      you need help with.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                        <p className="text-xs text-slate-400">
                          💊 Medication
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                        <p className="text-xs text-slate-400">
                          🩺 Symptoms
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                        <p className="text-xs text-slate-400">
                          📅 Appointments
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                        <p className="text-xs text-slate-400">
                          🏥 Healthcare
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.type === "user"
                            ? "rounded-br-md bg-cyan-500 text-slate-950"
                            : "rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200"
                        }`}
                      >
                        <div className="mb-1 text-[11px] font-semibold opacity-60">
                          {message.type === "user" ? "You" : "🤖 MediReach AI"}
                        </div>

                        <p className="text-sm leading-6">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="border-t border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Patient ID:{" "}
                  <span className="font-mono text-slate-400">
                    {patientIdRef.current}
                  </span>
                </p>

                <p className="text-xs text-slate-600">Session active</p>
              </div>
            </div>
          </div>
        </div>

        {/* DEBUG PANEL */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-200">🐞 Debug Panel</h3>
              <p className="text-xs text-slate-500">
                Live logs — no need to open DevTools.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={testBackendConnection}
                disabled={testingBackend}
                className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {testingBackend ? "Testing..." : "Test Backend Connection"}
              </button>

              <button
                onClick={() => setDebugLogs([])}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
              >
                Clear Logs
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-white/5 bg-black/30 p-3 font-mono text-xs">
            {debugLogs.length === 0 ? (
              <p className="text-slate-600">No logs yet.</p>
            ) : (
              debugLogs.map((log) => (
                <div
                  key={log.id}
                  className={`mb-1 ${
                    log.level === "error"
                      ? "text-red-400"
                      : log.level === "warn"
                      ? "text-amber-400"
                      : "text-slate-400"
                  }`}
                >
                  <span className="text-slate-600">[{log.time}]</span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAIAssistant;