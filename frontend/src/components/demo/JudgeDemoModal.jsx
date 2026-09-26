import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Languages, 
  Flame, 
  Building2, 
  FileText, 
  Sliders, 
  Play,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function JudgeDemoModal() {
  const { 
    isJudgeDemoOpen, 
    closeJudgeDemo, 
    judgeDemoStep, 
    setJudgeDemoStep, 
    nextJudgeStep, 
    prevJudgeStep,
    isAutoPlaying,
    setIsAutoPlaying 
  } = useApp();

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isAutoPlaying && isJudgeDemoOpen) {
      timer = setInterval(() => {
        setJudgeDemoStep((prev) => {
          if (prev < 10) return prev + 1;
          setIsAutoPlaying(false);
          return prev;
        });
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, isJudgeDemoOpen, setJudgeDemoStep, setIsAutoPlaying]);

  if (!isJudgeDemoOpen) return null;

  const steps = [
    {
      num: 1,
      title: "Citizen Signal Received",
      category: "Input Channel",
      icon: Languages,
      route: "/citizen",
      content: {
        rawInput: "మా గ్రామంలో గత రెండు సంవత్సరాలుగా తాగునీటి సమస్య ఉంది. వేసవిలో పరిస్థితి మరింత తీవ్రంగా మారుతుంది.",
        channel: "IVR Voice Call / WhatsApp",
        location: "Mandals, Telangana"
      },
      explanation: "A rural citizen records a voice message in regional language (Telugu) reporting severe summer drinking water shortages."
    },
    {
      num: 2,
      title: "Language Detection",
      category: "Multilingual AI",
      icon: Languages,
      route: "/citizen",
      content: {
        detectedLang: "Telugu (తెలుగు)",
        confidence: "99.2%",
        family: "Dravidian / South Asian BRICS dialect"
      },
      explanation: "The NLP pipeline identifies language without manual tagging, unlocking voices across 50+ regional dialects."
    },
    {
      num: 3,
      title: "Neural AI Translation",
      category: "Translation Engine",
      icon: Sparkles,
      route: "/citizen",
      content: {
        translation: "Our village has had a drinking water problem for the past two years. The situation becomes even more severe in summer.",
        sentiment: "High Distress (0.86)"
      },
      explanation: "Transforms unstructured regional text into normalized policy-ready English while preserving emotional urgency."
    },
    {
      num: 4,
      title: "Request Classification",
      category: "DPI Taxonomy",
      icon: Building2,
      route: "/citizen",
      content: {
        category: "Water & Sanitation",
        subcategory: "Drinking Water Grid",
        urgency: "High"
      },
      explanation: "Maps the complaint onto standardized national infrastructure categories automatically."
    },
    {
      num: 5,
      title: "Geospatial Location Extraction",
      category: "Geocoding",
      icon: Flame,
      route: "/hotspots",
      content: {
        location: "Telangana Rural Belt",
        coordinates: "17.8744° N, 78.1008° E",
        affectedPopulation: "8,400 residents"
      },
      explanation: "Extracts geographic coordinates and correlates with census block demographic data."
    },
    {
      num: 6,
      title: "Infrastructure Gap Analysis",
      category: "Gap Diagnostic",
      icon: Building2,
      route: "/infrastructure",
      content: {
        regionalCoverage: "68%",
        deficit: "32% Piped Grid Deficit",
        investmentCap: "₹145 Cr Unfunded Gap"
      },
      explanation: "Cross-references citizen demand with existing spatial infrastructure asset coverage maps."
    },
    {
      num: 7,
      title: "Explainable Priority Scoring",
      category: "Priority Engine",
      icon: Flame,
      route: "/hotspots",
      content: {
        totalScore: "91/100",
        breakdown: "Demand: 28/30 | Gap: 23/25 | Pop: 18/20 | Urgency: 13/15 | Investment: 9/10"
      },
      explanation: "Applies transparent 5-factor mathematical weighting so decision makers understand exact prioritization."
    },
    {
      num: 8,
      title: "AI Project Recommendation",
      category: "Intervention Design",
      icon: Sparkles,
      route: "/recommendations",
      content: {
        projectTitle: "Regional Water Resilience & Solar Desalination Program",
        cost: "₹145 Cr",
        beneficiaries: "184,000 residents"
      },
      explanation: "Generates tailored civil engineering interventions matched to regional constraints."
    },
    {
      num: 9,
      title: "Policy Brief Generation",
      category: "Executive Briefing",
      icon: FileText,
      route: "/policy-brief",
      content: {
        document: "Executive Policy Brief #PB-2026-TEL-WATER",
        status: "Ready for Ministerial Review"
      },
      explanation: "Produces complete executive policy briefs in seconds for cabinet and treasury approvals."
    },
    {
      num: 10,
      title: "Impact Simulation & Outcome Projection",
      category: "Impact Modeling",
      icon: Sliders,
      route: "/impact",
      content: {
        complaintsAfter: "1,284 → 742 (-34%)",
        accessAfter: "68% → 91% (+23%)",
        status: "Projected 3-Year ROI Validated"
      },
      explanation: "Simulates public access improvements and complaint reduction before capital allocation."
    }
  ];

  const currentStep = steps[judgeDemoStep - 1];
  const StepIcon = currentStep.icon;

  const handleNavigate = () => {
    navigate(currentStep.route);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1628] border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl shadow-cyan-500/20 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 p-[1px]">
              <div className="w-full h-full bg-[#07111F] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">3-MINUTE JUDGE DEMO WALKTHROUGH</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  Step {judgeDemoStep} of 10
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Citizen Signal → AI Intelligence → Policy Decision → Impact Simulation</p>
            </div>
          </div>
          <button 
            onClick={closeJudgeDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="my-4">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Pipeline Step: <strong className="text-cyan-400">{currentStep.title}</strong></span>
            <span>{Math.round((judgeDemoStep / 10) * 100)}% Completed</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-500/20">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(judgeDemoStep / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="my-5 p-5 rounded-xl bg-[#07111F] border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <StepIcon className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">{currentStep.category}</span>
                <h4 className="text-base font-bold text-white">{currentStep.title}</h4>
              </div>
            </div>
            <button
              onClick={handleNavigate}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium"
            >
              View Page →
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            {currentStep.explanation}
          </p>

          {/* Dynamic Step Data Showcase */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {Object.entries(currentStep.content).map(([key, val]) => (
              <div key={key} className="p-3 rounded-lg bg-[#0B1628] border border-slate-800/80">
                <p className="text-[10px] uppercase text-slate-500 font-semibold">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-xs font-bold text-cyan-300 mt-1 truncate">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isAutoPlaying 
                  ? 'bg-purple-900/40 text-purple-300 border-purple-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isAutoPlaying ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoPlaying ? 'Pause Auto-Play' : 'Auto-Play (4s/step)'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevJudgeStep}
              disabled={judgeDemoStep === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={nextJudgeStep}
              disabled={judgeDemoStep === 10}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
