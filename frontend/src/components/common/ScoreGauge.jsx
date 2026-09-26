import React from 'react';

export default function ScoreGauge({ score = 90, size = 120, strokeWidth = 10, title = "Priority Score" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#22D3EE";
  if (score >= 87) strokeColor = "#EF4444";
  else if (score >= 80) strokeColor = "#F59E0B";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#101D31"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Value Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-white tracking-tight">{score}</span>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">/100</span>
        </div>
      </div>
      {title && <span className="text-xs font-semibold text-slate-300 mt-2">{title}</span>}
    </div>
  );
}
