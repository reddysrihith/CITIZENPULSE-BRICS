import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Radio, 
  Languages,
  Edit3,
  Building2,
  AlertTriangle,
  Users
} from 'lucide-react';
import { analyzeRequest } from '../services/api';

export default function CitizenRequestPage() {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('Telugu');
  const [inputMode, setInputMode] = useState('text'); // 'text', 'voice', 'messaging'
  const [inputText, setInputText] = useState("మా గ్రామంలో గత రెండు సంవత్సరాలుగా తాగునీటి సమస్య ఉంది. వేసవిలో పరిస్థితి మరింత తీవ్రంగా మారుతుంది.");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sampleTexts = {
    Telugu: "మా గ్రామంలో గత రెండు సంవత్సరాలుగా తాగునీటి సమస్య ఉంది. వేసవిలో పరిస్థితి మరింత తీవ్రంగా మారుతుంది.",
    Hindi: "हमारे ब्लॉक के प्राथमिक स्वास्थ्य केंद्र में डॉक्टर नियमित नहीं आते और जरूरी दवाएं उपलब्ध नहीं हैं।",
    Portuguese: "A estrada rural entre Feira de Santana e o distrito vizinho está cheia de buracos e fica intransitável.",
    Russian: "В нашей деревне зимой регулярно отключают центральное отопление. Старая котельная не справляется.",
    Chinese: "山区的农产品无法及时通过5G网络在线销售，网络信号非常微弱，影响农户收入。"
  };

  const handleSelectSample = (lang) => {
    setSelectedLang(lang);
    setInputText(sampleTexts[lang] || sampleTexts.Telugu);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    let seconds = 0;
    const interval = setInterval(() => {
      seconds += 1;
      setRecordingTimer(seconds);
      if (seconds >= 4) {
        clearInterval(interval);
        setIsRecording(false);
        setRecordingTimer(0);
        setInputText(sampleTexts[selectedLang] || sampleTexts.Telugu);
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setProcessingStep(1);

    const steps = [
      "Detecting language...",
      "Translating request...",
      "Understanding intent & category...",
      "Extracting geographic coordinates...",
      "Assessing population impact & urgency...",
      "Analyzing infrastructure gap..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 350));
    }

    const res = await analyzeRequest({
      rawText: inputText,
      language: selectedLang,
      channel: inputMode === 'voice' ? 'Voice Call' : inputMode === 'messaging' ? 'WhatsApp' : 'Web Form'
    });

    setAnalysisResult(res);
    setIsProcessing(false);
  };

  const handleFinalSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Multilingual DPI Signal Ingestion</span>
        </div>
        <h1 className="text-3xl font-black text-white">Tell Us What Your Community Needs</h1>
        <p className="text-xs text-slate-400">Citizen input is captured via voice, text, or messaging in any regional language and processed by AI.</p>
      </div>

      {/* Input Card Container */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-6">
        {/* Language Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>Select Citizen Language:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {['Telugu', 'Hindi', 'Bengali', 'Portuguese', 'Russian', 'Chinese', 'English'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleSelectSample(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedLang === lang
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Channel Selection Tabs */}
        <div className="flex items-center gap-3">
          {[
            { id: 'text', label: 'TEXT INPUT', icon: FileText },
            { id: 'voice', label: 'VOICE CALL', icon: Mic },
            { id: 'messaging', label: 'MESSAGING APP', icon: MessageSquare }
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setInputMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  inputMode === mode.id
                    ? 'bg-purple-900/40 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900/40 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Field Body */}
        {inputMode === 'text' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe the infrastructure issue in your community..."
              className="w-full bg-[#07111F] text-slate-100 placeholder-slate-500 p-4 rounded-xl border border-slate-700/80 focus:outline-none focus:border-cyan-500/80 text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Sample pre-loaded for quick evaluation.</span>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze Request with AI</span>
              </button>
            </div>
          </form>
        )}

        {inputMode === 'voice' && (
          <div className="text-center py-8 space-y-4 bg-[#07111F] rounded-xl border border-slate-800 p-6">
            <div className="flex justify-center">
              <button
                onClick={handleStartRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-red-500/20 border-2 border-red-500 animate-pulse text-red-400' 
                    : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:scale-105'
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-200">
              {isRecording ? `Recording citizen voice signal (${recordingTimer}s)...` : 'Click microphone to record citizen voice'}
            </p>
            {isRecording && (
              <div className="flex justify-center items-center gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: `${Math.random() * 24 + 8}px`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            )}
            {!isRecording && inputText && (
              <div className="pt-2">
                <p className="text-xs text-slate-400 italic">Transcribed Voice Text: "{inputText}"</p>
                <button
                  onClick={handleSubmit}
                  className="mt-3 px-6 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Analyze Voice Recording
                </button>
              </div>
            )}
          </div>
        )}

        {inputMode === 'messaging' && (
          <div className="bg-[#07111F] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold text-slate-300">WhatsApp / Telegram Citizen Bot Integration</span>
            </div>
            <div className="bg-[#0B1628] p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
              <p className="text-[10px] text-emerald-400 font-bold mb-1">Incoming Signal +91 98490 *****</p>
              <p className="italic">"{inputText}"</p>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600 text-white hover:bg-purple-500"
            >
              Process Messaging Signal
            </button>
          </div>
        )}
      </div>

      {/* AI Processing Step Animation */}
      {isProcessing && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-white">AI Multilingual Pipeline Processing...</h3>
          <div className="space-y-2 max-w-sm mx-auto">
            {[
              "Detecting language...",
              "Translating request...",
              "Understanding intent & category...",
              "Extracting geographic coordinates...",
              "Assessing population impact & urgency...",
              "Analyzing infrastructure gap..."
            ].map((st, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                {processingStep > idx ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0"></div>
                )}
                <span className={processingStep > idx ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                  {st}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted AI Analysis Card */}
      {analysisResult && !isProcessing && (
        <div className="glass-panel-glow p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">AI Extracted Request Intelligence</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              Confidence: {Math.round(analysisResult.confidence * 100)}%
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#07111F] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Detected Language</span>
              <p className="font-bold text-cyan-300 text-sm">{analysisResult.language}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#07111F] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Extracted Category</span>
              <p className="font-bold text-purple-300 text-sm">{analysisResult.category} ({analysisResult.subcategory})</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#07111F] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Extracted Location</span>
              <p className="font-bold text-slate-200">{analysisResult.location}, {analysisResult.country}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#07111F] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Assessed Urgency</span>
              <p className="font-bold text-amber-400">{analysisResult.urgency}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#07111F] border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Neural English Translation</span>
            <p className="text-xs text-slate-200 leading-relaxed italic">"{analysisResult.translation}"</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">Estimated Affected Population: <strong className="text-cyan-300">{analysisResult.affectedPopulation?.toLocaleString()} residents</strong></span>
            
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitted}
              className="px-6 py-3 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              {isSubmitted ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{isSubmitted ? 'Submitted to National Intelligence!' : 'Submit to Citizen Intelligence'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
