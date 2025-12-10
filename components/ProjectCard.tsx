import React, { useState } from 'react';
import { FoodProject, SceneType } from '../types';

interface ProjectCardProps {
  project: FoodProject;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // We use a string key like "0-image" or "0-video" to track copied state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8 shadow-lg">
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white capitalize flex items-center gap-2">
          <span className="bg-cyan-500/10 text-cyan-400 p-1.5 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </span>
          {project.foodName}
        </h3>
        {project.isGeneratingText && (
          <span className="text-xs text-cyan-400 animate-pulse font-mono">Designing Scenes...</span>
        )}
      </div>

      <div className="p-4 grid grid-cols-1 gap-6">
        {project.scenes.map((scene, idx) => {
          const isOutfit = scene.type === SceneType.OUTFIT;
          const isHook = scene.type === SceneType.HOOK;
          
          let cardStyle = 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600';
          let labelStyle = 'bg-slate-800 text-slate-300 border-slate-700';
          let labelText = `SCENE ${idx}`;
          let titleColor = 'text-cyan-200';
          let imageBorder = 'border-purple-900/30';

          if (isOutfit) {
            cardStyle = 'bg-purple-900/20 border-purple-500/30 hover:border-purple-400/50';
            labelStyle = 'bg-purple-900 text-purple-200 border-purple-700';
            labelText = 'CHARACTER & OUTFIT';
            titleColor = 'text-purple-200';
            imageBorder = 'border-pink-900/30';
          } else if (isHook) {
             cardStyle = 'bg-red-900/20 border-red-500/30 hover:border-red-400/50';
             labelStyle = 'bg-red-900 text-red-200 border-red-700';
             labelText = 'HOOK (1-SEC)';
             titleColor = 'text-red-200';
             imageBorder = 'border-red-900/30';
          }
          
          return (
            <div key={idx} className={`rounded-lg p-5 border transition-colors ${cardStyle}`}>
              
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                   <span className={`text-xs font-bold px-2 py-0.5 rounded border ${labelStyle}`}>
                     {labelText} 
                   </span>
                   <span className="text-sm font-bold text-white uppercase tracking-wider">{scene.type}</span>
                </div>
                <div className={`text-sm font-medium ${titleColor}`}>
                  {scene.title}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* IMAGE PROMPT */}
                <div className="flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-semibold flex items-center gap-1 ${isOutfit ? 'text-pink-400' : isHook ? 'text-red-400' : 'text-purple-400'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                         </svg>
                         IMAGE PROMPT
                      </span>
                   </div>
                   <div className={`flex-grow bg-slate-950 rounded p-3 text-xs text-slate-300 font-mono leading-relaxed border mb-2 ${imageBorder}`}>
                      {scene.imagePrompt}
                   </div>
                   <button
                      onClick={() => handleCopy(scene.imagePrompt, `${idx}-image`)}
                      className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-300 transition-all flex justify-center items-center gap-2"
                    >
                       {copiedKey === `${idx}-image` ? <span className="text-green-400">Copied!</span> : "Copy Image Prompt"}
                    </button>
                </div>

                {/* VIDEO PROMPT */}
                <div className="flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l4 2A1 1 0 0020 14V6a1 1 0 00-1.447-.894l-4 2z" />
                         </svg>
                         VIDEO PROMPT
                      </span>
                   </div>
                   <div className="flex-grow bg-slate-950 rounded p-3 text-xs text-slate-300 font-mono leading-relaxed border border-cyan-900/30 mb-2">
                      {scene.videoPrompt}
                   </div>
                   <button
                      onClick={() => handleCopy(scene.videoPrompt, `${idx}-video`)}
                      className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs text-slate-300 transition-all flex justify-center items-center gap-2"
                    >
                       {copiedKey === `${idx}-video` ? <span className="text-green-400">Copied!</span> : "Copy Video Prompt"}
                    </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};