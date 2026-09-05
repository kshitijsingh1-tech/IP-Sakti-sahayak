import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface VoiceInputButtonProps {
  /**
   * Callback invoked whenever new speech is transcribed.
   * Receives the updated full text to be placed into the input.
   */
  onTranscript: (updatedText: string) => void;
  /**
   * The current text in the input field before voice dictation starts.
   * Speech will be appended smoothly to this text.
   */
  currentText?: string;
  /**
   * Language code (e.g. 'en', 'hi')
   */
  lang?: string;
  className?: string;
  buttonSize?: 'sm' | 'md';
  title?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  currentText = '',
  lang = 'en',
  className = '',
  buttonSize = 'md',
  title = 'Voice to text (Speak formulation or query)',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveInterim, setLiveInterim] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);

  // References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const initialTextRef = useRef<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const activeListeningRef = useRef<boolean>(false);
  const webSpeechResultRef = useRef<string>('');

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    activeListeningRef.current = false;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  /**
   * Starts microphone recording with audio level analyzer and dual transcription engines
   */
  const startListening = async () => {
    setErrorMessage(null);
    setLiveInterim('');
    audioChunksRef.current = [];
    webSpeechResultRef.current = '';
    initialTextRef.current = currentText;

    // 1. Request microphone access via getUserMedia (forces browser permission popup if needed)
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
    } catch (err: any) {
      console.warn('[VoiceInput] Microphone permission denied or unavailable:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone blocked. Click the lock icon in the browser address bar to allow microphone.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No microphone detected. Please plug in or enable an audio input device.');
      } else {
        setErrorMessage(`Microphone error: ${err.message || 'Access denied'}`);
      }
      return;
    }

    activeListeningRef.current = true;
    setIsListening(true);

    // 2. Setup Audio Volume Analyzer for live visual sound feedback
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          if (!activeListeningRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setVolumeLevel(Math.min(100, Math.round((average / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
    } catch (e) {
      console.warn('[VoiceInput] Volume analyzer unavailable:', e);
    }

    // 3. Setup MediaRecorder for backend Whisper AI transcription
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250); // Slice into 250ms chunks
    } catch (recorderErr) {
      console.warn('[VoiceInput] MediaRecorder init error:', recorderErr);
    }

    // 4. In parallel, attempt client-side Web Speech Recognition for instant streaming interim text
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
          (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          let sessionTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            sessionTranscript += event.results[i][0].transcript;
          }
          const trimmed = sessionTranscript.trim();
          if (trimmed) {
            webSpeechResultRef.current = trimmed;
            setLiveInterim(trimmed);

            const base = initialTextRef.current.trim();
            const fullText = base ? `${base} ${trimmed}` : trimmed;
            onTranscript(fullText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[VoiceInput] WebSpeech client-side warning:', event.error);
          // Do NOT stop active listening on no-speech or network; Whisper backend audio recording will handle it!
        };

        recognition.onend = () => {
          // If the user is still speaking and recognition auto-closed, restart it
          if (activeListeningRef.current && recognitionRef.current) {
            try {
              recognition.start();
            } catch {
              // ignore
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (speechErr) {
        console.warn('[VoiceInput] WebSpeech start error (will use Whisper backend):', speechErr);
      }
    }
  };

  /**
   * Stops recording and finalizes transcription via Groq Whisper backend
   */
  const stopListening = async () => {
    activeListeningRef.current = false;
    setIsListening(false);
    setVolumeLevel(0);

    // Stop volume animation
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Stop Web Speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Finalize MediaRecorder audio blob
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      setIsTranscribing(true);

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });

          // If audio was recorded, send to backend Whisper API
          if (audioBlob.size > 200) {
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('language', lang === 'hi' ? 'hi' : 'en');

            let transcribedText = '';

            try {
              const resp = await fetch('/api/v1/audio/transcribe', {
                method: 'POST',
                body: formData,
              });

              if (resp.ok) {
                const data = await resp.json();
                transcribedText = (data.text || '').trim();
              } else {
                console.warn('[VoiceInput] Backend Whisper returned status:', resp.status);
              }
            } catch (netErr) {
              console.warn('[VoiceInput] Fetch /api/v1/audio/transcribe network error:', netErr);
            }

            // Priority: Whisper AI -> WebSpeech transcript
            const finalText = transcribedText || webSpeechResultRef.current.trim();

            if (finalText) {
              const base = initialTextRef.current.trim();
              const combined = base ? `${base} ${finalText}` : finalText;
              onTranscript(combined);
              setLiveInterim(finalText);
            } else {
              setErrorMessage('No audible speech detected. Please speak closer to your microphone.');
            }
          } else {
            // Audio blob was too small or empty
            const fallbackSpeech = webSpeechResultRef.current.trim();
            if (fallbackSpeech) {
              const base = initialTextRef.current.trim();
              onTranscript(base ? `${base} ${fallbackSpeech}` : fallbackSpeech);
            } else {
              setErrorMessage('Recording was too short. Click the mic and speak formulation.');
            }
          }
        } catch (whisperErr) {
          console.warn('[VoiceInput] Whisper backend transcription error:', whisperErr);
          const fallback = webSpeechResultRef.current.trim();
          if (fallback) {
            const base = initialTextRef.current.trim();
            onTranscript(base ? `${base} ${fallback}` : fallback);
          } else {
            setErrorMessage('Could not process audio. Please check your mic.');
          }
        } finally {
          setIsTranscribing(false);
          cleanupAudio();
          setTimeout(() => setLiveInterim(''), 2500);
        }
      };

      try {
        recorder.stop();
      } catch {
        setIsTranscribing(false);
        cleanupAudio();
      }
    } else {
      cleanupAudio();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sizeClasses = buttonSize === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';

  return (
    <div className="relative shrink-0 flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={isTranscribing}
        title={
          isListening
            ? 'Click to stop and transcribe'
            : isTranscribing
            ? 'Transcribing audio...'
            : title
        }
        className={`rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 relative ${sizeClasses} ${
          isListening
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/30 scale-105'
            : isTranscribing
            ? 'bg-indigo-600 text-white animate-pulse cursor-wait'
            : 'hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-slate-950'
        } ${className}`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isTranscribing ? (
          <RefreshCw className="w-4 h-4 text-white animate-spin" />
        ) : isListening ? (
          <>
            {/* Animated pulsating halo */}
            <span className="absolute inset-0 rounded-full bg-rose-500 opacity-75 animate-ping pointer-events-none" />
            <MicOff className="w-4 h-4 text-white relative z-10" />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Floating Active Listening Pill Preview with Live Audio Volume Bars */}
      {isListening && (
        <div
          onClick={stopListening}
          className="absolute bottom-full mb-2 right-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/95 border border-rose-500/60 shadow-2xl backdrop-blur-md text-white text-xs font-semibold whitespace-nowrap z-50 cursor-pointer hover:bg-slate-900 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          title="Click to finish dictation"
        >
          {/* Recording Red Beacon */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>

          {/* Dynamic Audio Level Visualizer Bars */}
          <div className="flex items-center gap-0.5 h-3 px-1">
            <span
              className="w-0.5 bg-rose-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, Math.min(14, volumeLevel * 0.25))}px` }}
            />
            <span
              className="w-0.5 bg-rose-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, Math.min(16, volumeLevel * 0.4))}px` }}
            />
            <span
              className="w-0.5 bg-rose-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, Math.min(12, volumeLevel * 0.2))}px` }}
            />
          </div>

          <span className="text-slate-200 text-[11px] font-medium max-w-[200px] truncate">
            {liveInterim ? (
              <span className="italic text-white">"{liveInterim}"</span>
            ) : (
              'Listening... click to stop'
            )}
          </span>
        </div>
      )}

      {/* Floating Transcribing State */}
      {isTranscribing && (
        <div className="absolute bottom-full mb-2 right-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/95 border border-indigo-500/60 shadow-2xl backdrop-blur-md text-white text-xs font-semibold whitespace-nowrap z-50 pointer-events-none animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
          <span className="text-indigo-100 text-[11px] font-medium">
            AI Whisper transcribing...
          </span>
        </div>
      )}

      {/* Floating Actionable Error Toast */}
      {errorMessage && (
        <div className="absolute bottom-full mb-2 right-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/80 text-rose-100 text-[11px] font-medium shadow-2xl z-50 max-w-xs sm:max-w-sm">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="leading-snug">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-2 text-slate-400 hover:text-white font-bold cursor-pointer text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
