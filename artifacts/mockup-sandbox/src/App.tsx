import { useEffect, useRef, useState, useCallback } from "react";

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
  resultIndex: number;
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
}

type HistoryItem = {
  id: number;
  text: string;
  copiedAt?: Date;
};

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedMain, setCopiedMain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("ar-SA");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const idRef = useRef(0);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const initRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscript((prev) => (prev ? prev + " " + final.trim() : final.trim()));
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") return;
      if (event.error === "aborted") return;
      setError(
        event.error === "not-allowed"
          ? "لم يتم السماح بالوصول إلى الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح."
          : `خطأ في التعرف على الصوت: ${event.error}`
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    return recognition;
  }, [language]);

  const startListening = () => {
    if (!isSupported) return;
    const recognition = initRecognition();
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const saveToHistory = () => {
    const text = transcript.trim();
    if (!text) return;
    idRef.current += 1;
    setHistory((prev) => [{ id: idRef.current, text }, ...prev]);
    setTranscript("");
    setInterimText("");
  };

  const copyText = async (text: string, id: number | "main") => {
    await navigator.clipboard.writeText(text);
    if (id === "main") {
      setCopiedMain(true);
      setTimeout(() => setCopiedMain(false), 2000);
    } else {
      setCopiedId(id as number);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const clearAll = () => {
    setTranscript("");
    setInterimText("");
    setHistory([]);
  };

  useEffect(() => {
    return () => stopListening();
  }, []);

  const fullText = transcript + (interimText ? (transcript ? " " : "") + interimText : "");

  return (
    <div
      style={{ direction: language.startsWith("ar") ? "rtl" : "ltr" }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white font-sans flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <MicIcon className="w-4 h-4 text-indigo-300" />
          </div>
          <h1 className="text-lg font-semibold text-white">تحويل الصوت إلى نص</h1>
        </div>
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            if (isListening) stopListening();
          }}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
        >
          <option value="ar-SA">العربية</option>
          <option value="en-US">English</option>
          <option value="fr-FR">Français</option>
          <option value="es-ES">Español</option>
          <option value="de-DE">Deutsch</option>
          <option value="zh-CN">中文</option>
        </select>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-10 gap-8 max-w-2xl mx-auto w-full">
        {!isSupported && (
          <div className="w-full bg-red-500/10 border border-red-400/30 rounded-2xl p-4 text-red-300 text-sm text-center">
            متصفحك لا يدعم التعرف على الصوت. يرجى استخدام Chrome أو Edge.
          </div>
        )}

        {error && (
          <div className="w-full bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 text-amber-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Mic Button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={toggleListening}
            disabled={!isSupported}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-400/30 ${
              isListening
                ? "bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-110"
                : "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
            )}
            {isListening ? (
              <StopIcon className="w-10 h-10 text-white" />
            ) : (
              <MicIcon className="w-10 h-10 text-white" />
            )}
          </button>
          <p className="text-sm text-white/50">
            {isListening ? "جارٍ الاستماع... اضغط للإيقاف" : "اضغط للبدء"}
          </p>
        </div>

        {/* Transcript Box */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/3">
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">النص المُعرَّف</span>
            <div className="flex items-center gap-2">
              {fullText && (
                <>
                  <button
                    onClick={() => copyText(fullText, "main")}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/20 text-indigo-300 transition-all"
                  >
                    {copiedMain ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
                    {copiedMain ? "تم النسخ" : "نسخ"}
                  </button>
                  <button
                    onClick={saveToHistory}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/20 text-emerald-300 transition-all"
                  >
                    <SaveIcon className="w-3.5 h-3.5" />
                    حفظ
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="p-5 min-h-[140px]">
            {fullText ? (
              <p className="text-white/90 text-lg leading-relaxed">
                {transcript}
                {interimText && (
                  <span className="text-white/40 italic">{transcript ? " " : ""}{interimText}</span>
                )}
              </p>
            ) : (
              <p className="text-white/25 text-base">
                {isListening ? "تحدث الآن..." : "ابدأ التسجيل ليظهر النص هنا"}
              </p>
            )}
          </div>
        </div>

        {/* Live indicator */}
        {isListening && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-indigo-400 rounded-full animate-bounce"
                  style={{
                    height: `${8 + Math.random() * 20}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.6 + Math.random() * 0.4}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-indigo-300 text-sm">تسجيل...</span>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">النصوص المحفوظة</h2>
              <button
                onClick={clearAll}
                className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
              >
                مسح الكل
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-3 hover:bg-white/8 transition-colors"
                >
                  <p className="text-white/80 text-sm leading-relaxed flex-1">{item.text}</p>
                  <button
                    onClick={() => copyText(item.text, item.id)}
                    className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white/80 transition-all"
                  >
                    {copiedId === item.id ? (
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <CopyIcon className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
}

export default App;
