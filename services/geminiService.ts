import { GoogleGenAI, Type, Schema } from "@google/genai";

// Reusable schema for a single scene containing both prompt types
const promptPairSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Descriptive title (e.g., 'Strawberry Ruffle Dress' or 'Two-Handed Lift')" },
    imagePrompt: { type: Type.STRING, description: "Prompt for generating the static image" },
    videoPrompt: { type: Type.STRING, description: "Prompt for generating the video from the image" }
  },
  required: ["title", "imagePrompt", "videoPrompt"]
};

// Main Schema
const sceneSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    outfit: promptPairSchema,
    pool: promptPairSchema,
    pickup: promptPairSchema,
    bites: {
      type: Type.ARRAY,
      items: promptPairSchema,
      description: "List of different bite/shatter angles"
    }
  },
  required: ["outfit", "pool", "pickup", "bites"],
};

export interface PromptResponse {
  outfit: { title: string; imagePrompt: string; videoPrompt: string };
  pool: { title: string; imagePrompt: string; videoPrompt: string };
  pickup: { title: string; imagePrompt: string; videoPrompt: string };
  bites: Array<{ title: string; imagePrompt: string; videoPrompt: string }>;
}

export const generatePromptsForFood = async (foodName: string, biteCount: number): Promise<PromptResponse> => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing from process.env.API_KEY");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const systemInstruction = `
      You are the Creative Director for "GlassyBites", a famous high-fashion ASMR channel.
      
      CORE CONCEPT:
      1. JUMBO SURREAL SIZE: ALL food is OVERSIZED (Jumbo). Example: A strawberry the size of a human head, a macaron the size of a cake. It creates a "How will she eat that?" reaction.
      2. MATERIAL: All food is made of edible, hyper-realistic COLORED GLASS. Hard, glossy, crystalline.
      3. CONSISTENCY: The "Jumbo Glass Object" must look EXACTLY the same in every scene.
      4. FASHION MATCH: The model's outfit must strictly COORDINATE with the food (colors, textures, vibe). If the food is a Red Glass Apple, the dress might be red Avant-Garde PVC.

      Task: Generate a storyboard for: "${foodName}".
      
      Required Scenes:

      1. OUTFIT & CHARACTER (The Look)
         - Concept: Design the model's outfit to match the "${foodName}". Cute, High-Fashion, Avant-Garde.
         - Prompt Focus: Full body or 3/4 shot showing the Model wearing the specific outfit, posing with the JUMBO Glass ${foodName}.

      2. THE POOL JUMP (The Intro)
         - Concept: The Model jumps into a pool. Instead of water, the pool is filled with JUMBO Glass versions of the ${foodName}.
         - Action: Upon impact, the giant glass items splash and scatter heavily.
         - Vibe: Surreal fashion commercial.

      3. PICKUP (The Scale Reveal)
         - Concept: The Model uses TWO HANDS to lift the single JUMBO Glass ${foodName}.
         - Focus: emphasize the weight and size. It looks heavy and smooth.

      4. BITE ANGLES (The Climax)
         - Generate ${biteCount} DISTINCT bite scenes.
         - Concept: The Model takes a bite of the JUMBO glass item.
         - Action: It does NOT squish. It SHATTERS/EXPLODES into shards upon impact with teeth. 
         - Consistency: Ensure it's still the huge item.

      Prompt Guidelines:
      
      A) IMAGE PROMPT:
         - Start with "A hyper-realistic photo of..."
         - Keywords: "Jumbo size [food]", "Surreal scale", "Translucent glass texture", "Fashion editorial", "8k resolution".
      
      B) VIDEO PROMPT (For Veo 3.1):
         - Start with "Cinematic video of..."
         - Keywords: "Shattering", "Heavy impact", "Crystal sound visuals", "Slow motion", "Fashion lighting".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate the GlassyBites storyboard for: "${foodName}" (JUMBO SIZE) with ${biteCount} bite variations.`,
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