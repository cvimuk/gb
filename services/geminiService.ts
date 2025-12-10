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
  // Check all common prefixes used in Vercel/Vite/Next.js/React environments
  // This solves the issue where "Gkey" might be hidden from the browser
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
      You are the Creative Director for "GlassyBites", a high-fashion fantasy commercial channel.
      
      CORE CONCEPT & SAFETY CONTEXT:
      1. JUMBO SIZE: All food is OVERSIZED (Jumbo).
      2. MATERIAL: **EDIBLE SUGAR GLASS (Isomalt)**. 
         *IMPORTANT*: This is NOT real glass. It is CANDY shaped like glass. It is safe to eat.
         *Describe it as "Glassy Candy" or "Crystal Edible Art" to ensure safety compliance.*
      3. ASMR FOCUS: "Satisfying Crunchy Sounds" mixed with "High Fashion Beauty".
      
      CRITICAL INSTRUCTION FOR OUTFITS:
      - Define the outfit ONCE in the "OUTFIT" scene.
      - IN THE BITE SCENES: You MUST include the Model wearing this outfit.
      
      Task: Generate a storyboard for: "${foodName}".
      
      Required Scenes:

      1. THE HOOK (1 Second Attention Grabber)
         - Concept: The Model holding the JUMBO Edible Glass Food next to her face.
         - Visual: Medium Close-up or Head-and-Shoulders. Beautiful studio lighting.
         - Action: The Model interacts with the MASSIVE food. 
            - She might tap it with nails (ASMR Tapping).
            - She might tease a bite.
            - She uses the food as a fashion accessory.
         - Goal: Stop the scroll immediately. Face + Jumbo Food + Beauty.

      2. OUTFIT & CHARACTER (The Reference Look)
         - Concept: Design the model's outfit to match the "${foodName}".
         - Prompt Focus: Full body or 3/4 shot showing the Model wearing the specific outfit, posing with the JUMBO ${foodName}.

      3. THE POOL JUMP (Surreal Dive)
         - Action: The Model jumps into a pool FILLED ENTIRELY with the ${foodName}.
         - CRITICAL RULE: **NO WATER**. The pool contains NO CLEAR WATER.
         - Visual Logic:
            * Liquid Foods (Sauce/Soup/Honey): The pool is filled with the thick liquid sauce/soup itself. She splashes into the sauce.
            * Solid Foods (Cookies/Fruit/Fried): It is a "Ball Pit" of millions of ${foodName}s. She jumps into a pile of them.
         - Visual: Surreal, high-impact splash of food particles or sauce.

      4. BITE & CHEW VARIATIONS (The ASMR Core - ${biteCount} shots)
         - Concept: FASHION EATING.
         - FRAMING RULE:
           - **SHOW THE MODEL**. Do not just show lips.
           - VARY THE ANGLES: 
             1. Side Profile (Half-Body).
             2. Frontal (Head to Chest).
             3. 3/4 Angle (Shoulder up).
             4. Close-up on eyes/jaw (but still showing face parts).
         - ACTION RULE:
           - Shot 1: The Bite & Shatter (Explosion of sugar glass).
           - Shot 2+ (The Rest): **FOCUS ON RHYTHMIC CHEWING**.
           - Show the jaw moving. Show the crunch. Show the model savoring the texture.
           - The Model looks beautiful and calm, treating the crunch like music.

      Prompt Guidelines:
      A) IMAGE PROMPT: "Hyper-realistic commercial photography", "Fashion model [description]...", "Jumbo [Food] made of translucent sugar glass", "Cinematic lighting".
      B) VIDEO PROMPT: "Cinematic slow motion", "Model chewing rhythmically", "Jaw movement", "Crunching physics", "Sugar glass shattering", "Refractive light".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate GlassyBites storyboard for: "${foodName}" (JUMBO SUGAR GLASS) with ${biteCount} chewing/bite variations.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: sceneSchema,
        // Safety settings to allow "eating glass-like objects" (Isomalt/Candy)
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