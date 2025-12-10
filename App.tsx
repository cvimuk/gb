import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { ProjectCard } from './components/ProjectCard';
import { ApiKeyConfig } from './components/ApiKeyConfig';
import { FoodProject, GeneratedScene, SceneType } from './types';
import { generatePromptsForFood } from './services/geminiService';

const App: React.FC = () => {
  const [projects, setProjects] = useState<FoodProject[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleGeneratePrompts = async (foodList: string[], biteCount: number) => {
    if (!apiKey) {
      alert("Please enter your Gemini API Key first.");
      return;
    }

    setGlobalLoading(true);
    
    // Create new project placeholders
    const newProjects: FoodProject[] = foodList.map(food => ({
      id: Math.random().toString(36).substr(2, 9),
      foodName: food,
      scenes: [],
      isGeneratingText: true
    }));

    // Add to state immediately
    setProjects(prev => [...newProjects, ...prev]);

    // Process sequentially
    await Promise.allSettled(newProjects.map(async (project) => {
      try {
        const result = await generatePromptsForFood(project.foodName, biteCount, apiKey);
        
        const scenes: GeneratedScene[] = [
          {
            type: SceneType.HOOK,
            title: result.hook.title || "The 1-Sec Hook",
            imagePrompt: result.hook.imagePrompt,
            videoPrompt: result.hook.videoPrompt
          },
          {
            type: SceneType.OUTFIT,
            title: result.outfit.title || "Fashion Reference",
            imagePrompt: result.outfit.imagePrompt,
            videoPrompt: result.outfit.videoPrompt
          },
          { 
            type: SceneType.POOL, 
            title: result.pool.title || "The Pool Jump", 
            imagePrompt: result.pool.imagePrompt,
            videoPrompt: result.pool.videoPrompt
          },
          ...result.bites.map((bite, index) => ({
            type: SceneType.BITE,
            title: bite.title || `Chew/Bite ${index + 1}`,
            imagePrompt: bite.imagePrompt,
            videoPrompt: bite.videoPrompt
          }))
        ];

        setProjects(prev => prev.map(p => 
          p.id === project.id 
            ? { ...p, scenes, isGeneratingText: false } 
            : p
        ));

      } catch (error: any) {
        console.error(`Failed to generate prompts for ${project.foodName}`, error);
        
         setProjects(prev => prev.map(p => 
          p.id === project.id 
            ? { 
                ...p, 
                isGeneratingText: false, 
                scenes: [{
                  type: SceneType.POOL, 
                  title: 'Generation Failed', 
                  imagePrompt: 'Error generating prompts. Check your API Key.', 
                  videoPrompt: 'Please try again.'
                }] 
              } 
            : p
        ));
      }
    }));

    setGlobalLoading(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      
      <ApiKeyConfig onSave={handleSaveApiKey} hasKey={!!apiKey} />

      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
          GlassyBites Prompt Studio
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Generate <span className="text-purple-400 font-semibold">Fashion-Matched</span> & <span className="text-cyan-300 font-semibold">Jumbo Glass Food</span> prompts for Veo 3.1 & NanoBanana.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <InputSection onGenerate={handleGeneratePrompts} isLoading={globalLoading} />
             <div className="mt-8 bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-sm text-slate-500">
               <h4 className="text-slate-300 font-semibold mb-2">Workflow</h4>
               <ul className="list-disc list-inside space-y-2">
                 <li><strong className="text-red-400">Step 1:</strong> The 1-Sec Hook (Tapping/Snap).</li>
                 <li><strong className="text-purple-400">Step 2:</strong> Outfit Reference.</li>
                 <li><strong className="text-blue-400">Step 3:</strong> Pool Jump (Splashing).</li>
                 <li><strong className="text-cyan-400">Step 4:</strong> Chewing & Crunching ASMR.</li>
               </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {projects.length === 0 && !globalLoading ? (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-600">
              <p>No projects yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;