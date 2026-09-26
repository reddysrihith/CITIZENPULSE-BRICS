import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [systemStatus, setSystemStatus] = useState('Healthy');
  
  // Judge Demo Workflow State
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);
  const [judgeDemoStep, setJudgeDemoStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const startJudgeDemo = () => {
    setJudgeDemoStep(1);
    setIsJudgeDemoOpen(true);
  };

  const closeJudgeDemo = () => {
    setIsJudgeDemoOpen(false);
    setIsAutoPlaying(false);
  };

  const nextJudgeStep = () => {
    if (judgeDemoStep < 10) {
      setJudgeDemoStep(prev => prev + 1);
    }
  };

  const prevJudgeStep = () => {
    if (judgeDemoStep > 1) {
      setJudgeDemoStep(prev => prev - 1);
    }
  };

  return (
    <AppContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        selectedLanguage,
        setSelectedLanguage,
        isDemoMode,
        setIsDemoMode,
        systemStatus,
        setSystemStatus,
        isJudgeDemoOpen,
        judgeDemoStep,
        setJudgeDemoStep,
        startJudgeDemo,
        closeJudgeDemo,
        nextJudgeStep,
        prevJudgeStep,
        isAutoPlaying,
        setIsAutoPlaying
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
