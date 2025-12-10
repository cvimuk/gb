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

export const generatePromptsForFood = async (foodName: string, biteCount: number): Promise<PromptResponse> => {
  // 1. Aggressive API Key Detection
  const apiKey = 
    process.env.Gkey || 
    process.env.VITE_Gkey || 
    process.env.NEXT_PUBLIC_Gkey || 
    process.env.REACT_APP_Gkey || 
    process.env.API_KEY;
  
  if (!apiKey) {
    console.error("Available Env Vars:", Object.keys(process.env));
    throw new Error("API Key not found. Please check your Vercel Environment Variables. Ensure 'Gkey' is added.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      You are the Creative Director for "GlassyBites", a famous high-fashion ASMR channel.
      
      CORE CONCEPT:
      1. JUMBO SURREAL SIZE: ALL food is OVERSIZED (Jumbo).
      2. MATERIAL: All food is made of edible, hyper-realistic COLORED GLASS. 
         - It looks sharp, shiny, and translucent like real glass.
         - It shatters like glass.
      3. ASMR FOCUS: The goal is "Satisfying Glass Sounds" mixed with "High Fashion Beauty".
      
      CRITICAL INSTRUCTION FOR OUTFITS:
      - Define the outfit ONCE in the "OUTFIT" scene.
      - IN THE BITE SCENES: You MUST include the Model wearing this outfit.
      
      Task: Generate a storyboard for: "${foodName}".
      
      Required Scenes:

      1. THE HOOK (1 Second Attention Grabber)
         - Concept: The Model holding the JUMBO Glass Food next to her face. Scale comparison.
         - Visual: Medium Close-up or Head-and-Shoulders. Beautiful lighting.
         - Action: The Model interacts with the MASSIVE glass food.
            - She might tap it with long manicured nails (Teasing).
            - She might pretend to take a bite.
            - She might stare intensely at the camera while holding the heavy food.
         - Goal: Show the Face + The Jumbo Food + The Vibe immediately.

      2. OUTFIT & CHARACTER (The Reference Look)
         - Concept: Design the model's outfit to match the "${foodName}".
         - Prompt Focus: Full body or 3/4 shot showing the Model wearing the specific outfit, posing with the JUMBO Glass ${foodName}.

      3. THE POOL JUMP (Grand Opening)
         - Action: The Model jumps into a pool FILLED ENTIRELY with the ${foodName}.
         - CRITICAL RULE: **NO WATER**. The pool contains NO CLEAR WATER.
         - Visual Logic:
            * If the food is saucy/liquid (e.g., Carbonara, Curry, Honey): The pool is filled with Jumbo Glass Noodles and thick Glass Sauce. She splashes into the sauce/pasta itself.
            * If the food is solid (e.g., Cookies, Berries, Fried Chicken): It acts like a "Ball Pit" of Jumbo Glass items. She splashes into a pile of them.
         - Visual: Heavy displacement of the ${foodName}. Surreal immersion.

      4. BITE & CHEW VARIATIONS (The ASMR Core - ${biteCount} shots)
         - Concept: BEAUTY MEETS CRUNCH.
         - FRAMING RULE:
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
        responseSchema: sceneSchema,
        // Keep safety settings permissive for "glass eating" context to avoid blocks, 
        // but removed the "Candy" text instruction as requested.
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      }
    });

    if (response.text) {
      // Robust JSON parsing: Remove potential Markdown code blocks
      const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText) as PromptResponse;
    }
    throw new Error("No response text generated");

  } catch (error) {
    console.error("Error generating text prompts:", error);
    throw error;
  }
};