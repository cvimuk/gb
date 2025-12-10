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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || apiKey });

    const systemInstruction = `
      You are the Creative Director for "GlassyBites", a famous high-fashion ASMR channel.
      
      CORE CONCEPT:
      1. JUMBO SURREAL SIZE: ALL food is OVERSIZED (Jumbo).
      2. MATERIAL: All food is made of edible, hyper-realistic COLORED GLASS.
      3. ASMR FOCUS: The goal is "Satisfying Glass Sounds" mixed with "High Fashion Beauty".
      
      CRITICAL INSTRUCTION FOR OUTFITS:
      - Define the outfit ONCE in the "OUTFIT" scene.
      - IN THE BITE SCENES: You MUST include the Model wearing this outfit. Do not describe the dress in detail again, but ensure the prompt places the "Model" in the shot.

      Task: Generate a storyboard for: "${foodName}".
      
      Required Scenes:

      1. THE HOOK (1 Second Attention Grabber)
         - Concept: The Model holding the JUMBO Glass Food next to her face. Scale comparison.
         - Visual: Medium Close-up or Head-and-Shoulders. Beautiful lighting.
         - Action: Choose ONE creative hook:
            A) Model tapping the glass with long manicured nails (ASMR trigger).
            B) Model staring intensely at camera while licking the glass.
            C) Model struggling to hold the heavy jumbo food, teasing a bite.
         - Goal: Show the Face + The Jumbo Food + The Vibe immediately.

      2. OUTFIT & CHARACTER (The Reference Look)
         - Concept: Design the model's outfit to match the "${foodName}".
         - Prompt Focus: Full body or 3/4 shot showing the Model wearing the specific outfit, posing with the JUMBO Glass ${foodName}.

      3. THE POOL JUMP (Grand Opening)
         - Action: The Model jumps into a pool filled with JUMBO Glass versions of the ${foodName}.
         - Visual: Heavy splashing of glass items. (This is the Main Explosion).

      4. BITE & CHEW VARIATIONS (The ASMR Core - ${biteCount} shots)
         - Concept: BEAUTY MEETS CRUNCH.
         - FRAMING RULE (Very Important):
           - DO NOT just do macro lips. Show the MODEL.
           - VARY the angles: 
             1. Side Profile (Half-Body).
             2. Frontal (Head to Chest).
             3. 3/4 Angle (Shoulder up).
           - Maintain the "Fashion" aesthetic even while eating.
         - ACTION RULE:
           - Shot 1 (Only): The Bite & Shatter. The glass breaks upon contact with teeth.
           - Shot 2+ (The Rest): FOCUSED ON CHEWING. Show the jaw moving rhythmically. Show the model enjoying the "Crunch". 
           - The Model should look beautiful, calm, or euphoric while chewing the sharp glass.
         - Vibe: Crunchy, satisfying, dangerous but delicious. 

      Prompt Guidelines:
      A) IMAGE PROMPT: "Hyper-realistic photo", "Fashion photography", "Studio lighting", "Model [description]...", "Jumbo [Food] made of glass".
      B) VIDEO PROMPT: "Cinematic video", "ASMR visual", "Model chewing", "Jaw movement", "Crunching physics", "Glass refracting light".
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
