import React, { useState } from 'react';

interface InputSectionProps {
  onGenerate: (foodList: string[], biteCount: number) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const [biteCount, setBiteCount] = useState(3);

  const handleGenerate = () => {
    if (!text.trim()) return;
    // Split by new line, trim, and filter empty
    const foodList = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (foodList.length > 0) {
      onGenerate(foodList, biteCount);
      setText(''); // Optional: clear after submit
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        GlassyBites Menu Input
      </h2>
      <p className="text-slate-400 text-sm mb-4">
        Enter food names. AI will convert them into <span className="text-cyan-400 font-semibold">Glass/ASMR</span> video prompts.
      </p>
      
      <div className="mb-4">
        <label className="block text-slate-300 text-xs font-bold mb-2 uppercase tracking-wide">
          Bite Variations: <span className="text-cyan-400 text-lg ml-1">{biteCount}</span>
        </label>
        <input 
          type="range" 
          min="1" 
          max="6" 
          value={biteCount} 
          onChange={(e) => setBiteCount(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>1 Angle</span>
          <span>6 Angles</span>
        </div>
      </div>

      <textarea
        className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none placeholder-slate-600 font-mono text-sm"
        placeholder={`Glass Strawberry\nCrystal Burger\nGlass Honeycomb`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isLoading}
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !text.trim()}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all w-full justify-center md:w-auto
            ${isLoading || !text.trim() 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20'
            }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            <>
              Generate Glassy Prompts
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};