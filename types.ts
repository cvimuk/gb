export interface FoodItem {
  id: string;
  name: string;
}

export enum SceneType {
  OUTFIT = 'OUTFIT',
  POOL = 'POOL',
  PICKUP = 'PICKUP',
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