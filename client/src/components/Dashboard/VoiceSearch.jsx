import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mic, MicOff, Globe, X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useFilters } from '../../contexts/FilterContext';

export default function VoiceSearch() {
  const { handleVoiceFilters: onVoiceFilters, activeRole } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState('en-US');
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const autoSubmitRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang;

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
      };

      rec.onresult = (event) => {
        const current = event.resultIndex;
        const resultText = event.results[current][0].transcript;
        setTranscript(resultText);
        autoSubmitRef.current = true;
      };

      rec.onerror = (event) => {
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again or type below.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please type your query below.');
        } else if (event.error === 'network') {
          setError('Speech recognition network error. Please type your query below.');
        } else {
          setError(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      setError('Web Speech API is not supported in this browser. Please use Chrome or Edge.');
    }
  }, [lang]);

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current.start();
      }, 300);
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Failed to start microphone.');
      }
    }
  };

  const handleProcessSpeech = async (speechText) => {
    if (!speechText) return;
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/server/voice_ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': activeRole || 'SCRB_ADMIN'
        },
        body: JSON.stringify({
          text: speechText,
          language: lang
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned code ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.filters) {
        onVoiceFilters(data.filters, speechText);
        setIsOpen(false);
      } else {
        throw new Error('Failed to resolve filters on backend.');
      }

    } catch (err) {
      console.warn('Backend voice analysis failed. Falling back to local offline parser...', err.message);
      const localFilters = localParseSpeech(speechText);
      onVoiceFilters(localFilters, speechText);
      setIsOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!isListening && transcript && !processing && isOpen && autoSubmitRef.current) {
      const timer = setTimeout(() => {
        if (autoSubmitRef.current) {
          handleProcessSpeech(transcript);
          autoSubmitRef.current = false;
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, processing, isOpen]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const localParseSpeech = (text) => {
    const textLower = text.toLowerCase();
    const filters = {
      districtId: 'all',
      unitId: 'all',
      dateRange: '30days',
      gravity: 'all',
      searchTerm: ''
    };

    if (textLower.includes('bengaluru') || textLower.includes('bangalore') || textLower.includes('ಬೆಂಗಳೂರು') || textLower.includes('ಬೆಂಗಳೂರಿನ')) {
      filters.districtId = '1';
    } else if (textLower.includes('mysuru') || textLower.includes('mysore') || textLower.includes('ಮೈಸೂರು') || textLower.includes('ಮೈಸೂರಿನ')) {
      filters.districtId = '2';
    } else if (textLower.includes('belagavi') || textLower.includes('belgaum') || textLower.includes('ಬೆಳಗಾವಿ') || textLower.includes('ಬೆಳಗಾವಿಯ')) {
      filters.districtId = '3';
    } else if (textLower.includes('dakshina kannada') || textLower.includes('mangaluru') || textLower.includes('mangalore') || textLower.includes('ದಕ್ಷಿಣ ಕನ್ನಡ') || textLower.includes('ಮಂಗಳೂರು') || textLower.includes('ಮಂಗಳೂರಿನ')) {
      filters.districtId = '4';
    } else if (textLower.includes('kalaburagi') || textLower.includes('gulbarga') || textLower.includes('ಕಲಬುರಗಿ') || textLower.includes('ಕಲಬುರಗಿಯ')) {
      filters.districtId = '5';
    }

    if (textLower.includes('shivajinagar') || textLower.includes('ಶಿವಾಜಿನಗರ')) {
      filters.unitId = '1';
    } else if (textLower.includes('indiranagar') || textLower.includes('ಇಂದಿರಾನಗರ')) {
      filters.unitId = '2';
    } else if (textLower.includes('halasuru') || textLower.includes('ulsoor') || textLower.includes('ಹಲಸೂರು')) {
      filters.unitId = '3';
    } else if (textLower.includes('devaraja') || textLower.includes('ದೇವರಾಜ')) {
      filters.unitId = '4';
    } else if (textLower.includes('lakshmipuram') || textLower.includes('ಲಕ್ಷ್ಮಿಪುರಂ')) {
      filters.unitId = '5';
    } else if (textLower.includes('belagavi town') || textLower.includes('ಬೆಳಗಾವಿ ಟೌನ್')) {
      filters.unitId = '6';
    } else if (textLower.includes('mangaluru south') || textLower.includes('ಮಂಗಳೂರು ದಕ್ಷಿಣ') || textLower.includes('south ps')) {
      filters.unitId = '7';
    } else if (textLower.includes('kalaburagi city') || textLower.includes('ಕಲಬುರಗಿ ಸಿಟಿ') || textLower.includes('city ps')) {
      filters.unitId = '8';
    }

    if (textLower.includes('heinous') || textLower.includes('serious') || textLower.includes('grave') || textLower.includes('ಘೋರ') || textLower.includes('ಗಂಭೀರ')) {
      filters.gravity = '1';
    } else if (textLower.includes('non-heinous') || textLower.includes('non heinous') || textLower.includes('ordinary') || textLower.includes('simple') || textLower.includes('ಘೋರವಲ್ಲದ') || textLower.includes('ಸಾಮಾನ್ಯ')) {
      filters.gravity = '2';
    }

    if (textLower.includes('30 days') || textLower.includes('last month') || textLower.includes('ಕಳೆದ ತಿಂಗಳು') || textLower.includes('೩೦ ದಿನ')) {
      filters.dateRange = '30days';
    } else if (textLower.includes('90 days') || textLower.includes('three months') || textLower.includes('೩ ತಿಂಗಳು')) {
      filters.dateRange = '90days';
    } else if (textLower.includes('1 year') || textLower.includes('last year') || textLower.includes('12 months') || textLower.includes('ಕಳೆದ ವರ್ಷ') || textLower.includes('೧ ವರ್ಷ')) {
      filters.dateRange = '1year';
    } else if (textLower.includes('ytd') || textLower.includes('year to date') || textLower.includes('this year') || textLower.includes('ಈ ವರ್ಷ')) {
      filters.dateRange = 'ytd';
    }

    const suspects = ['rajesh choudhary', 'rajesh', 'imran basappa', 'imran', 'sneha yellappa', 'sneha', 'vikas gupta', 'vikas', 'anil deshpande', 'anil'];
    for (const name of suspects) {
      if (textLower.includes(name)) {
        filters.searchTerm = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    if (!filters.searchTerm) {
      const crimeTerms = {
        'cyber': 'Cyber',
        'online': 'Cyber',
        'ಸೈಬರ್': 'Cyber',
        'burglary': 'Burglary',
        'theft': 'Theft',
        'snatching': 'Snatching',
        'fraud': 'Fraud',
        'murder': 'Murder',
        'ಕೊಲೆ': 'Murder',
        'ಕಳ್ಳತನ': 'Theft',
        'ಗಾಂಜಾ': 'Cannabis',
        'cannabis': 'Cannabis',
        'ganja': 'Cannabis',
        'narcotics': 'Narcotics',
        'vehicle': 'Vehicle'
      };
      for (const key in crimeTerms) {
        if (textLower.includes(key)) {
          filters.searchTerm = crimeTerms[key];
          break;
        }
      }
    }

    return filters;
  };

  const modalContent = (
    <div className="fixed inset-0 bg-[var(--color-surface-elevated-dark)]/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out">
      <div className="bg-[var(--color-canvas-dark)]/90 backdrop-blur-xl border border-[var(--color-hairline-dark)] rounded-3xl w-[95vw] sm:w-full sm:max-w-md lg:max-w-lg shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)] p-5 sm:p-6 relative max-h-[95vh] flex flex-col overflow-hidden transform scale-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--color-primary)]/20 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 flex-shrink-0 flex items-center justify-between pb-3 border-b border-[var(--color-hairline-dark)]/60 mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-[20px] w-[20px] text-[var(--color-primary)]" />
            <h3 className="text-base font-bold text-[var(--color-on-dark)] tracking-wide">Voice Search AI</h3>
          </div>
          <button
            onClick={() => {
              if (isListening && recognitionRef.current) {
                recognitionRef.current.stop();
              }
              setIsOpen(false);
            }}
            className="text-[var(--color-muted)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)] rounded-full transition-colors p-1.5"
            aria-label="Close voice search modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative z-10 flex-shrink-0 flex justify-center space-x-3 mb-4">
          <button
            onClick={() => setLang('en-US')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all ${
              lang === 'en-US'
                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                : 'bg-[var(--color-surface-elevated-dark)]/50 text-[var(--color-muted)] border-[var(--color-hairline-dark)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)]'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>English (US)</span>
          </button>
          <button
            onClick={() => setLang('kn-IN')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all ${
              lang === 'kn-IN'
                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] border-[var(--color-primary)]/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                : 'bg-[var(--color-surface-elevated-dark)]/50 text-[var(--color-muted)] border-[var(--color-hairline-dark)] hover:text-[var(--color-on-dark)] hover:bg-[var(--color-surface-elevated-dark)]'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>ಕನ್ನಡ (Kannada)</span>
          </button>
        </div>

        <div className="relative z-10 flex-grow flex flex-col justify-center px-1">
          <div className="flex flex-col items-center justify-center space-y-4">
            <button
              onClick={toggleListening}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border transition-all duration-300 ${
                isListening
                  ? 'bg-red-900/20 border-red-500/50 text-red-500 scale-105 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                  : 'bg-[var(--color-surface-elevated-dark)]/50 border-[var(--color-hairline-dark)] text-[var(--color-primary)] hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] shadow-lg shadow-[var(--color-primary)]/5'
              }`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full border border-red-500/40 animate-ping opacity-75" />
                  <span className="absolute -inset-3 rounded-full border border-red-500/20 animate-pulse" />
                </>
              )}
              {isListening ? <MicOff className="h-8 w-8 sm:h-10 sm:w-10" /> : <Mic className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />}
            </button>

            <div className="text-center w-full px-2">
              <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2">
                {isListening ? 'Listening...' : processing ? 'Analyzing...' : 'Click mic to begin dictation'}
              </p>

              {isListening && (
                <div className="flex justify-center items-end space-x-1.5 h-6 my-2">
                  <span className="w-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s', height: '12px' }} />
                  <span className="w-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s', height: '24px' }} />
                  <span className="w-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.3s', height: '18px' }} />
                  <span className="w-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.4s', height: '22px' }} />
                  <span className="w-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0.5s', height: '10px' }} />
                </div>
              )}

              {processing && (
                <div className="flex justify-center my-2 text-[var(--color-primary)]">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              )}

              <div className="relative min-h-[4rem] flex items-center justify-center rounded-sm bg-[var(--color-surface-elevated-dark)]/60 border border-[var(--color-hairline-dark)]/80 shadow-inner group">
                <textarea
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    autoSubmitRef.current = false;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleProcessSpeech(transcript);
                      autoSubmitRef.current = false;
                    }
                  }}
                  placeholder={lang === 'kn-IN' ? 'Shivajinagar PS ನಲ್ಲಿ ಆಸ್ತಿ ಅಪರಾಧ...' : 'Show active cases in Bengaluru Urban...'}
                  className="w-full bg-transparent text-sm italic font-medium leading-relaxed text-[var(--color-on-dark)] placeholder-slate-500 focus:outline-none resize-none p-3 pb-8 text-center"
                  rows={2}
                />
                <button 
                  onClick={() => {
                    handleProcessSpeech(transcript);
                    autoSubmitRef.current = false;
                  }}
                  disabled={!transcript.trim() || processing}
                  className="absolute bottom-2 right-2 p-1.5 bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/40 rounded-sm transition-colors disabled:opacity-50"
                  title="Submit Query"
                  aria-label="Submit voice query"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0">
          {error && (
            <div className="mt-3 bg-red-900/20 border border-red-500/30 text-red-400 p-2.5 rounded-sm flex items-start space-x-2 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="border-t border-[var(--color-hairline-dark)]/60 mt-4 pt-4 text-[10px] text-[var(--color-muted)] font-semibold space-y-1.5 bg-[var(--color-canvas-dark)]/30 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 px-5 pb-5 sm:px-6 sm:pb-6 rounded-b-3xl">
            <p className="uppercase text-[var(--color-muted)] tracking-wider mb-1.5">Example commands:</p>
            <p className="flex items-start break-words"><span className="w-1 h-1 rounded-full bg-[var(--color-primary)]/50 mr-2 mt-1.5 shrink-0"></span> "Show me cyber crimes in Mysore" / "ಮೈಸೂರಿನಲ್ಲಿ ಸೈಬರ್ ಅಪರಾಧ"</p>
            <p className="flex items-start break-words"><span className="w-1 h-1 rounded-full bg-[var(--color-primary)]/50 mr-2 mt-1.5 shrink-0"></span> "Show heinous crimes in Bengaluru" / "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಘೋರ ಅಪರಾಧಗಳು"</p>
            <p className="flex items-start break-words"><span className="w-1 h-1 rounded-full bg-[var(--color-primary)]/50 mr-2 mt-1.5 shrink-0"></span> "Find cases about Rajesh Choudhary" / "ರಾಜೇಶ್ ಚೌಧರಿ ಪ್ರಕರಣಗಳು"</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-[var(--color-surface-elevated-dark)] border border-[var(--color-hairline-dark)] rounded-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-canvas-dark)] transition-all hover:scale-105 duration-150 flex items-center justify-center cursor-pointer shadow-md shrink-0"
        title="Voice Search AI"
        aria-label="Voice Search AI"
      >
        <Mic className="h-[18px] w-[18px] shrink-0" />
      </button>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
