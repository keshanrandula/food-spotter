'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  MapPin, 
  Utensils, 
  Compass, 
  ArrowRight, 
  Globe, 
  Volume2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VoiceQueryResult } from '@/types';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoiceSearch: (query: { keyword: string; location: string; cuisine?: string }) => void;
  onAskChefAi?: (query: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onApplyVoiceSearch,
  onAskChefAi,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'si-LK' | 'en-US'>('si-LK');
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<VoiceQueryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setParsedResult(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg(null);
    setParsedResult(null);
    setTranscript('');

    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or click one of the quick voice prompts below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please allow microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please speak clearly into your microphone.');
        } else {
          setErrorMsg(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not start microphone');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const processQuery = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/voice-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToProcess,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setParsedResult(data.data);
      } else {
        setErrorMsg(data.error || 'Failed to process voice query');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Voice interpretation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!parsedResult) return;

    onApplyVoiceSearch({
      keyword: parsedResult.extractedKeyword || '',
      location: parsedResult.extractedLocation || 'Colombo, Sri Lanka',
      cuisine: parsedResult.extractedCuisine || '',
    });
    onClose();
  };

  const handleTestPrompt = (sampleText: string, lang: 'si-LK' | 'en-US') => {
    setSelectedLanguage(lang);
    setTranscript(sampleText);
    processQuery(sampleText);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-savor-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-savor-500/25">
              <Mic size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 font-serif">
                  Smart Voice Search
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-savor-100 dark:bg-savor-950/60 text-savor-700 dark:text-savor-300 border border-savor-300 dark:border-savor-800">
                  සිංහල / English
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Speak naturally in Sinhala, Singlish or English to discover food
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Language Selector */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setSelectedLanguage('si-LK');
                if (isListening) stopListening();
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedLanguage === 'si-LK'
                  ? 'bg-savor-600 text-white shadow-md shadow-savor-600/25'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Globe size={14} />
              <span>සිංහල (Sinhala)</span>
            </button>
            <button
              onClick={() => {
                setSelectedLanguage('en-US');
                if (isListening) stopListening();
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedLanguage === 'en-US'
                  ? 'bg-savor-600 text-white shadow-md shadow-savor-600/25'
                  : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Globe size={14} />
              <span>English (Global)</span>
            </button>
          </div>

          {/* Glowing Microphone Visualizer */}
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
            <div className="relative">
              {/* Animated pulsating waves when listening */}
              {isListening && (
                <>
                  <div className="absolute -inset-4 rounded-full bg-savor-500/20 animate-ping" />
                  <div className="absolute -inset-8 rounded-full bg-savor-500/10 animate-pulse" />
                </>
              )}

              <button
                onClick={isListening ? stopListening : startListening}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-600 to-savor-500 text-white scale-110 shadow-savor-500/50 ring-4 ring-savor-400'
                    : 'bg-savor-600 hover:bg-savor-700 text-white shadow-savor-600/30 hover:scale-105'
                }`}
              >
                {isListening ? <Mic size={38} className="animate-pulse" /> : <Mic size={38} />}
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {isListening
                  ? selectedLanguage === 'si-LK'
                    ? 'කරුණාකර කතා කරන්න... (Listening)'
                    : 'Listening... speak now'
                  : 'Tap microphone to speak'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {selectedLanguage === 'si-LK'
                  ? 'උදා: "මට නුගේගොඩින් බිරියානි කන්න හොඳ තැනක් කියන්න"'
                  : 'e.g. "Find best spicy burgers in Colombo"'}
              </p>
            </div>
          </div>

          {/* Live Transcript / Speech text box */}
          {(transcript || isProcessing) && (
            <div className="p-4 rounded-2xl bg-stone-100/90 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase">
                <span>Transcript</span>
                {isProcessing && <span className="text-savor-600 animate-pulse">Analyzing with AI...</span>}
              </div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 italic">
                "{transcript || 'Listening...'}"
              </p>

              {!isListening && transcript && !parsedResult && !isProcessing && (
                <button
                  onClick={() => processQuery(transcript)}
                  className="mt-2 w-full py-2 rounded-xl bg-savor-600 hover:bg-savor-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Analyze Spoken Query</span>
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PARSED AI RESULT DISPLAY */}
          {parsedResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={14} />
                <span>Voice Intent Recognized!</span>
              </div>

              <p className="text-xs text-stone-700 dark:text-stone-300">
                {parsedResult.interpretedIntent}
              </p>

              {/* Extracted Entity Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {parsedResult.extractedLocation && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-600" />
                    <span>Location: <strong>{parsedResult.extractedLocation}</strong></span>
                  </span>
                )}
                {parsedResult.extractedKeyword && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <Utensils size={12} className="text-emerald-600" />
                    <span>Food: <strong>{parsedResult.extractedKeyword}</strong></span>
                  </span>
                )}
                {parsedResult.extractedCuisine && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200 border border-emerald-300 dark:border-emerald-700">
                    Cuisine: <strong>{parsedResult.extractedCuisine}</strong>
                  </span>
                )}
                {parsedResult.extractedMood && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-200 border border-emerald-300 dark:border-emerald-700">
                    Vibe: <strong>{parsedResult.extractedMood}</strong>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleApply}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Compass size={14} />
                  <span>Apply Search to Map & List</span>
                  <ArrowRight size={14} />
                </button>

                {onAskChefAi && (
                  <button
                    onClick={() => {
                      onAskChefAi(transcript);
                      onClose();
                    }}
                    className="py-3 px-3 rounded-xl bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 border border-stone-200 dark:border-zinc-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Ask Chef AI Concierge"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="hidden sm:inline">Ask Chef AI</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick Voice Demo Prompts */}
          <div className="pt-1 space-y-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Or Try One-Click Spoken Examples:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleTestPrompt('මට නුගේගොඩින් බිරියානි කන්න හොඳ තැනක් කියන්න', 'si-LK')}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800/60 hover:bg-savor-50 dark:hover:bg-savor-950/30 text-left text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700 hover:border-savor-300 transition cursor-pointer flex items-center gap-2"
              >
                <span>🎙️</span>
                <span>"මට නුගේගොඩින් බිරියානි කන්න තැනක්"</span>
              </button>

              <button
                onClick={() => handleTestPrompt('ගාල්ලෙ හොඳ සීෆුඩ් රෙස්ටොරන්ට් එකක් හොයන්න', 'si-LK')}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800/60 hover:bg-savor-50 dark:hover:bg-savor-950/30 text-left text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700 hover:border-savor-300 transition cursor-pointer flex items-center gap-2"
              >
                <span>🎙️</span>
                <span>"ගාල්ලෙ හොඳ සීෆුඩ් රෙස්ටොරන්ට්"</span>
              </button>

              <button
                onClick={() => handleTestPrompt('Best Italian pizza and pasta in Colombo', 'en-US')}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800/60 hover:bg-savor-50 dark:hover:bg-savor-950/30 text-left text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700 hover:border-savor-300 transition cursor-pointer flex items-center gap-2"
              >
                <span>🎙️</span>
                <span>"Best Italian pizza in Colombo"</span>
              </button>

              <button
                onClick={() => handleTestPrompt('Romantic rooftop dinner spots in Colombo', 'en-US')}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-zinc-800/60 hover:bg-savor-50 dark:hover:bg-savor-950/30 text-left text-xs font-medium text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-zinc-700 hover:border-savor-300 transition cursor-pointer flex items-center gap-2"
              >
                <span>🎙️</span>
                <span>"Romantic rooftop dinner spots"</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
