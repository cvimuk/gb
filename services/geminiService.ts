import { GoogleGenAI, Type, Schema } from "@google/genai";

// Reusable schema for a single scene containing both prompt types
const promptPairSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Descriptive title (e.g., 'The Crunch', 'Chewing Close-up')" },
    imagePrompt: { type: Type.STRING, description: "Prompt for generating the static image" },
    videoPrompt: { type: Type.STRING, description: "Prompt for generating the video from the image" }
  },
  required: ["title", "imagePrompt", "videoPrompt"]
};

// Main Schema
const sceneSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hook: promptPairSchema,
    outfit: promptPairSchema,
    pool: promptPairSchema,
    bites: {
      type: Type.ARRAY,
      items: promptPairSchema,
      description: "List of different bite/chew angles"
    }
  },
  required: ["hook", "outfit", "pool", "bites"],
};

export interface PromptResponse {
  hook: { title: string; imagePrompt: string; videoPrompt: string };
  outfit: { title: string; imagePrompt: string; videoPrompt: string };
  pool: { title: string; imagePrompt: string; videoPrompt: string };
  bites: Array<{ title: string; imagePrompt: string; videoPrompt: string }>;
}

export const generatePromptsForFood = async (foodName: string, biteCount: number, apiKey: string): Promise<PromptResponse> => {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const systemInstruction = `
      You are the Creative Director for "GlassyBites", a famous high-fashion ASMR channel.
      
      CORE CONCEPT:
      1. JUMBO SURREAL SIZE: ALL food is OVERSIZED (Jumbo).
      2. MATERIAL: All food is made of edible, hyper-realistic COLORED GLASS.
      3. ASMR FOCUS: The goal is "Satisfying Glass Sounds".
      
      CRITICAL INSTRUCTION FOR OUTFITS:
      - ONLY describe the fashion/outfit in detail in the "OUTFIT" scene.
      - In ALL other scenes (Hook, Pool, Bites), DO NOT mention the dress/outfit details. Focus ONLY on the action, the mouth, and the glass texture.

      Task: Generate a storyboard for: "${foodName}".
      
      Required Scenes:

      1. THE HOOK (1 Second Attention Grabber)
         - Concept: A split-second ASMR trigger to stop the scroll.
         - Action: Either a fingernail TAPPING the glass food (Tapping sound), or a small utensil hitting it.
         - Visual: Extreme Macro Close-up. 

      2. OUTFIT & CHARACTER (The Reference Look)
         - Concept: Design the model's outfit to match the "${foodName}".
         - Prompt Focus: Full body or 3/4 shot showing the Model wearing the specific outfit, posing with the JUMBO Glass ${foodName}.

      3. THE POOL JUMP (Grand Opening)
         - Action: The Model jumps into a pool filled with JUMBO Glass versions of the ${foodName}.
         - Visual: Heavy splashing of glass items. (This is Explosion #1).

      4. BITE & CHEW VARIATIONS (The ASMR Core - ${biteCount} shots)
         - Concept: REALISTIC CHEWING ASMR.
         - Action: 
            - Shot 1: The First Bite (Cracking/Shattering).
            - Shot 2+: CHEWING. Show the jaw moving. Show the glass being ground into smaller crystals inside the mouth.
         - Vibe: Crunchy, satisfying, dangerous but delicious. 
         - NOTE: NOT every shot needs to be an explosion. Focus on the "Grind" and "Crunch" texture.

      Prompt Guidelines:
      A) IMAGE PROMPT: "Hyper-realistic photo...", "Macro lens", "8k", "Glass texture".
      B) VIDEO PROMPT: "Cinematic video...", "ASMR visual", "Detailed chewing motion", "Crunching physics".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate GlassyBites storyboard for: "${foodName}" (JUMBO SIZE) with ${biteCount} chewing/bite variations.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: sceneSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PromptResponse;
    }
    throw new Error("No response text generated");

  } catch (error) {
    console.error("Error generating text prompts:", error);
    throw error;
  }
};