export interface FoodItem {
  id: string;
  name: string;
}

export enum SceneType {
  HOOK = 'HOOK',
  OUTFIT = 'OUTFIT',
  POOL = 'POOL',
  BITE = 'BITE'
}

export interface GeneratedScene {
  type: SceneType;
  title: string;
  imagePrompt: string;
  videoPrompt: string;
}

export interface FoodProject {
  id: string;
  foodName: string;
  scenes: GeneratedScene[];
  isGeneratingText: boolean;
}

// Augment the global Window interface to include aistudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}