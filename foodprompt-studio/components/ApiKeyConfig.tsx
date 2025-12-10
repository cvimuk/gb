import React, { useState, useEffect } from 'react';

interface ApiKeyConfigProps {
  onSave: (key: string) => void;
  hasKey: boolean;
}

export const ApiKeyConfig: React.FC<ApiKeyConfigProps> = ({ onSave, hasKey }) => {
  const [isOpen, setIsOpen] = useState(!hasKey);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    // If we don't have a key on mount, force open
    if (!hasKey) setIsOpen(true);
  }, [hasKey]);

  const handleSave = () => {
    if (inputKey.trim()) {
      onSave(inputKey.trim());
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 px-3 rounded-full border border-slate-600 flex items-center gap-2 shadow-lg transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
        API Key
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Configure Gemini API Key
        </h3>
        <p className="text-slate-400 text-sm mb-6">
          To generate prompts, you need a Gemini API Key. It will be saved in your browser locally.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-bold mb-1 uppercase">Enter API Key</label>
            <input 
              type="password" 
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            {hasKey && (
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white font-medium text-sm"
              >
                Cancel
              </button>
            )}
            <button 
              onClick={handleSave}
              disabled={!inputKey.trim()}
              className={`px-6 py-2 rounded-lg font-bold text-slate-900 transition-all ${
                inputKey.trim() 
                  ? 'bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              Save Key
            </button>
          </div>
          
          <div className="pt-4 border-t border-slate-800 text-xs text-center text-slate-500">
            Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Get one from Google AI Studio</a>
          </div>
        </div>
      </div>
    </div>
  );
};
