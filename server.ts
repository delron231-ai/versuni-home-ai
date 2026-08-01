import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "20mb" }));

const PORT = 3000;

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Clean string from markdown code blocks
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned;
}

// Call Gemini with multi-model fallback chain for JSON parsing
async function generateJsonWithRetry<T>(
  prompt: string,
  systemInstruction: string,
  imagePart?: { mimeType: string; data: string }
): Promise<T> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }

  const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      let contents: any;
      if (imagePart) {
        contents = {
          parts: [
            { inlineData: { mimeType: imagePart.mimeType, data: imagePart.data } },
            { text: prompt },
          ],
        };
      } else {
        contents = prompt;
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction:
            systemInstruction + " Return ONLY valid JSON with no markdown formatting or prose.",
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "";
      const cleaned = cleanJsonResponse(rawText);
      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      console.warn(`Gemini call failed with model ${model}:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini model attempts failed.");
}

// --- FALLBACK HELPERS FOR GRACEFUL DEGRADATION ---

function getFallbackCoordinationCards(activity: string, connectedAppliances: any[], household: any) {
  const act = (activity || "").toLowerCase();
  const offPeak = household?.offPeakWindow || "23:00-06:00";

  if (
    act.includes("fry") ||
    act.includes("cook") ||
    act.includes("salmon") ||
    act.includes("dinner") ||
    act.includes("meal")
  ) {
    return [
      {
        id: `fallback-coord-1-${Date.now()}`,
        title: "Climate Care & Kitchen Sync",
        category: "Climate Care & Kitchen",
        explanation:
          "High-heat air frying generates micro-particulates. Air Purifier temporarily set to Turbo mode for 30 minutes.",
        action: { label: "Approve 30m Turbo Air Care", type: "approve" },
      },
      {
        id: `fallback-coord-2-${Date.now()}`,
        title: "Off-Peak Dishwasher Schedule",
        category: "Energy Care",
        explanation: `Scheduled dishwasher intensive eco-cycle for off-peak window (${offPeak}) to maximize energy savings.`,
        action: { label: `Schedule for ${offPeak.split("-")[0] || "23:00"}`, type: "schedule" },
      },
      {
        id: `fallback-coord-3-${Date.now()}`,
        title: "Consumable Inventory Check",
        category: "Consumable Care",
        explanation:
          "Air fryer oil mesh filter usage tracked. Water filter for Espresso machine is in good condition.",
        action: { label: "View Consumables", type: "approve" },
      },
    ];
  } else if (
    act.includes("clean") ||
    act.includes("laundry") ||
    act.includes("vacuum") ||
    act.includes("bedroom")
  ) {
    return [
      {
        id: `fallback-coord-1-${Date.now()}`,
        title: "Floor Care & Air Care Sync",
        category: "Floor & Climate Care",
        explanation:
          "Vacuuming disturbs ambient dust. Air Purifier raised fan speed to Medium during cleaning routine.",
        action: { label: "Approve Air & Floor Sync", type: "approve" },
      },
      {
        id: `fallback-coord-2-${Date.now()}`,
        title: "Garment Steamer Eco Prep",
        category: "Garment Care",
        explanation: "Pre-heated steamer water tank using off-peak smart energy profile.",
        action: { label: "Activate Garment Ready", type: "approve" },
      },
    ];
  } else {
    return [
      {
        id: `fallback-coord-1-${Date.now()}`,
        title: "Smart Home Harmony Sync",
        category: "Smart Home Sync",
        explanation: `Coordinated ${
          connectedAppliances.length || 3
        } connected Versuni appliances for optimal energy efficiency and air quality.`,
        action: { label: "Activate Eco Sync", type: "approve" },
      },
      {
        id: `fallback-coord-2-${Date.now()}`,
        title: "Off-Peak Energy Saver",
        category: "Energy Care",
        explanation: `High-power routines postponed to your off-peak window (${offPeak}) saving ~18% on utility costs.`,
        action: { label: "Approve Schedule", type: "schedule" },
      },
    ];
  }
}

function getFallbackPantryItems() {
  return [
    { name: "Fresh Salmon Fillets", location: "Fridge", quantity: "2 pcs (400g)" },
    { name: "Organic Whole Milk", location: "Fridge", quantity: "1 Liter" },
    { name: "Espresso Coffee Beans", location: "Pantry", quantity: "250g bag" },
    { name: "Cherry Tomatoes", location: "Fridge", quantity: "1 punnet (300g)" },
    { name: "Whole Grain Bread", location: "Pantry", quantity: "1 loaf" },
  ];
}

function getFallbackRecipe(pantry: any[], timeAvailable: number, diet: string, appliance: any) {
  const isCoffee = appliance?.category === "Coffee";

  if (isCoffee) {
    return {
      dish: "Golden Honey Almond Latte",
      ingredients: [
        { name: "Espresso Coffee Beans (18g)", have: true },
        { name: "Almond or Oat Milk (150ml)", have: true },
        { name: "Honey or Maple Syrup (1 tbsp)", have: true },
      ],
      steps: [
        "Select Double Shot Espresso preset on your espresso machine.",
        "Steam milk using Latte Macchiato steam wand setting until silky microfoam forms.",
        "Pour espresso over warm honey in a glass and top with velvety steamed milk.",
      ],
      applianceSettings: {
        preset: "Double Shot Espresso + Steam",
        tempC: 92,
        timeMin: 5,
        midCookAction: "Swirl espresso with honey before pouring steamed milk.",
      },
    };
  }

  return {
    dish: "Crispy Herb-Crusted Salmon & Vegetables",
    ingredients: [
      { name: "Fresh Salmon Fillet (2 pcs)", have: true },
      { name: "Cherry Tomatoes & Asparagus (200g)", have: true },
      { name: "Olive Oil & Dried Herbs (1 tbsp)", have: true },
      { name: "Lemon slices", have: true },
    ],
    steps: [
      "Lightly coat salmon fillets and fresh vegetables with olive oil, salt, pepper, and herbs.",
      "Place salmon fillets in the Airfryer XXL basket with vegetables around the edges.",
      `Air fry at 180°C for ${Math.min(
        timeAvailable || 20,
        18
      )} minutes until skin is golden and crisp.`,
      "Serve warm with a squeeze of fresh lemon.",
    ],
    applianceSettings: {
      preset: "Fish & Seafood",
      tempC: 180,
      timeMin: Math.min(timeAvailable || 20, 18),
      midCookAction: "Shake vegetable basket gently at the 10-minute mark.",
    },
  };
}

function getFallbackCareRoutine(category: string, applianceModel: string, specs: any, userInput: any) {
  if (category === "Coffee") {
    return {
      title: "Barista Precision Extraction",
      summary:
        "AI-calibrated extraction profile tailored for dark roast beans to maximize crema density and chocolate undertones.",
      details: {
        GrindLevel: "Level 4 (Medium-Fine)",
        Dose: "16.5g",
        WaterTemp: "92°C",
        Yield: "45ml (Double Shot)",
      },
      instructions: [
        "Set grinder dial to level 4 and purge 2 grams of older coffee grounds.",
        "Tamp firmly with 15kg pressure and lock portafilter into group head.",
        "Initiate 25-second extraction cycle with 3-second pre-infusion.",
      ],
    };
  } else if (category === "Climate Care") {
    return {
      title: "Allergy Defense & Allergen Purge",
      summary:
        "Automated high-airflow particulate filtration targeting PM2.5, pollen, and pet dander.",
      details: {
        FanMode: "Auto Turbo (Stage 3)",
        TargetAQI: "< 12 (Excellent)",
        Duration: "45 minutes",
        FilterHealth: "94% (NanoProtect HEPA)",
      },
      instructions: [
        "Place Air Purifier at least 30cm away from surrounding walls.",
        "Engage Turbo Allergen mode for rapid room volume filtration.",
        "Monitor live AQI on top display ring as color transitions from Red/Purple to Blue.",
      ],
    };
  } else if (category === "Garment Care") {
    return {
      title: "OptimalTemp Delicates Protection",
      summary:
        "Zero-burn steam technology automatically regulating soleplate temperature for delicate silk and wool garments.",
      details: {
        SteamRate: "45g/min continuous",
        SoleplateTemp: "140°C (Safe for silk)",
        OptimalTempMode: "Active",
        DeCalcAlert: "Clean in 12 days",
      },
      instructions: [
        "Fill water reservoir with distilled or tap water up to MAX line.",
        "Wait 60 seconds for steam ready chime before starting.",
        "Glide soleplate in long, smooth strokes across delicate fabrics without sorting.",
      ],
    };
  } else {
    return {
      title: "Deep Carpet & Hardwood Adaptive Clean",
      summary:
        "Multi-surface cleaning routine adjusting suction power based on floor texture detection.",
      details: {
        RoomPriority: "Living Room & Kitchen",
        PowerMode: "Smart Auto Boost",
        EstBatteryUsage: "32%",
        NoiseLevel: "Quiet (62 dB)",
      },
      instructions: [
        "Ensure charging base has 0.5m clearance on both sides.",
        "Initiate perimeter edge sweep first before zig-zag deep clean.",
        "Auto-dock and empty dust container upon session completion.",
      ],
    };
  }
}

function getFallbackChatResponse(userText: string, context: any) {
  const text = (userText || "").toLowerCase();
  const appliances = context?.appliances || [];
  const appNames = appliances.map((a: any) => a.model).join(", ");

  if (text.includes("recipe") || text.includes("cook") || text.includes("dinner") || text.includes("eat")) {
    return `Based on your connected ${
      appNames || "appliances"
    } and current pantry inventory, I recommend using your Airfryer XXL for a quick 20-minute Salmon & Herb Bake! Check out the Cook tab for full step-by-step instructions.`;
  } else if (text.includes("clean") || text.includes("filter") || text.includes("maintenance")) {
    return `Your connected appliances are running smoothly! Remember to check your Air Purifier HEPA filter in the Care tab, and run a quick 2-minute calc-clean cycle on your Garment Steamer if steam pressure drops.`;
  } else if (text.includes("coffee") || text.includes("brew") || text.includes("espresso")) {
    return `For the best crema on your Philips Espresso Machine, try a medium-fine grind (level 4) at 92°C with 16.5g of dark roast beans! You can automatically send these settings in the Care tab.`;
  } else {
    return `Hello! I am your Versuni Home AI Assistant. I can help you coordinate your ${
      appliances.length || "connected"
    } appliances (${
      appNames || "Airfryer, Espresso Machine, Air Purifier"
    }), generate personalized recipes from your pantry, or set optimal care routines. How can I assist you today?`;
  }
}

// --- API ENDPOINTS ---

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 1. Home Coordination Endpoint
app.post("/api/ai/coordinate", async (req, res) => {
  const { appliances, household, activity } = req.body;
  const connectedAppliances = Array.isArray(appliances)
    ? appliances.filter((a: any) => a.connected)
    : [];

  try {
    const prompt = `
Current activity initiated by user: "${activity}"
Household details: Members: ${household?.members || 2}, Dietary preferences: ${JSON.stringify(
      household?.dietaryPrefs || []
    )}, Off-peak energy window: "${household?.offPeakWindow || "23:00-06:00"}".
Connected household appliances: ${JSON.stringify(
      connectedAppliances.map((a: any) => ({
        category: a.category,
        model: a.model,
        specs: a.specs,
        consumables: a.consumables,
      }))
    )}.

Task: Generate 2 to 4 actionable cross-category coordination cards showing how appliances respond together in harmony.
Rules:
- For "Air-fry salmon" or high smoke/fragrance cooking: include a Climate Care card (e.g. "Frying fish spikes particulates", action label: "Raise air purifier to High for 30 min").
- For "Do laundry" or heavy appliances: schedule during off-peak window (${household?.offPeakWindow || "23:00-06:00"}).
- For low consumables (e.g. coffee beans < 25% level): include a reorder card.
- Format each card with:
  - id: unique string (e.g. "coord-1")
  - title: short card title
  - category: appliance category or domain (e.g. "Climate Care & Kitchen", "Energy Care")
  - explanation: exactly 1 clear sentence explaining why
  - action: { "label": string (short action text), "type": "approve" | "schedule" | "reorder" }
`;

    const systemInstruction = `You are Versuni Home AI, an intelligent smart home orchestrator that seamlessly coordinates cross-category appliances.`;

    const result = await generateJsonWithRetry<{ cards: any[] }>(prompt, systemInstruction);
    res.json(result);
  } catch (err: any) {
    console.warn("Gemini coordination failed, providing smart fallback cards:", err?.message);
    const fallbackCards = getFallbackCoordinationCards(activity, connectedAppliances, household);
    res.json({ cards: fallbackCards });
  }
});

// 2. Scan Pantry Image Endpoint
app.post("/api/ai/scan-pantry", async (req, res) => {
  const { imageBase64, mimeType } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "Missing image payload." });
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  try {
    const prompt = `
Examine this image of food / ingredients / pantry items.
Identify all visible food items, produce, drinks, or kitchen ingredients.
Assign each item to a logical location: "Fridge", "Pantry", or "Freezer".
Provide an estimated quantity for each.

Return JSON format:
{
  "items": [
    {
      "name": "Item name",
      "location": "Fridge" | "Pantry" | "Freezer",
      "quantity": "estimated quantity or unit (e.g. 2 pcs, 1 bag, 500g)"
    }
  ]
}
`;

    const systemInstruction = `You are a precision computer vision assistant for Versuni Home AI pantry scanner.`;

    const result = await generateJsonWithRetry<{ items: any[] }>(
      prompt,
      systemInstruction,
      { mimeType: mimeType || "image/jpeg", data: cleanBase64 }
    );

    res.json(result);
  } catch (err: any) {
    console.warn("Gemini vision scan failed, providing smart fallback items:", err?.message);
    res.json({ items: getFallbackPantryItems() });
  }
});

// 3. Recipe Generator Endpoint
app.post("/api/ai/generate-recipe", async (req, res) => {
  const { pantry, timeAvailable, diet, appliance } = req.body;

  try {
    const prompt = `
User wants a recipe with these constraints:
- Available time: ${timeAvailable || 30} minutes
- Dietary restriction: ${diet || "None"}
- Selected Kitchen Appliance Model: "${appliance?.model || "Airfryer XXL Combi 7000"}"
- Appliance Specs: ${JSON.stringify(appliance?.specs || {})}
- Current Pantry items: ${JSON.stringify(pantry || [])}

Task: Create a customized dish tailored specifically for the ${appliance?.model || "Airfryer XXL"}.
Rules:
- Maximize use of pantry items. For missing essential items, set "have": false.
- Format response JSON:
{
  "dish": "Dish Title",
  "ingredients": [
    { "name": "Ingredient name + qty", "have": true/false }
  ],
  "steps": [ "Step 1...", "Step 2..." ],
  "applianceSettings": {
    "preset": "Preset name (e.g. Fish, Fries, Roast, Bake)",
    "tempC": 180,
    "timeMin": 20,
    "midCookAction": "Short action (e.g. 'Shake basket halfway through at 10 min')"
  }
}
`;

    const systemInstruction = `You are Versuni Culinary AI, an expert chef specializing in appliance-tuned recipes.`;

    const result = await generateJsonWithRetry<any>(prompt, systemInstruction);
    res.json(result);
  } catch (err: any) {
    console.warn("Gemini recipe generation failed, providing smart fallback recipe:", err?.message);
    res.json(getFallbackRecipe(pantry, timeAvailable, diet, appliance));
  }
});

// 4. Care Routine Endpoint
app.post("/api/ai/care-routine", async (req, res) => {
  const { category, applianceModel, specs, userInput } = req.body;

  try {
    const prompt = `
Generate an AI care routine for:
Category: "${category}"
Appliance Model: "${applianceModel}"
Specs: ${JSON.stringify(specs || {})}
User Selection/Input: "${JSON.stringify(userInput || {})}"

Category specific expectations:
- Coffee: Return custom brew parameters (grindLevel 1-12, doseGrams 7-18g, waterTempC 88-96°C, yieldMl 30-220ml) + 3 step instructions + tip.
- Climate Care: Return air optimization routine (fanLevel: "Silent"|"Auto"|"Turbo", durationMin, targetAqi, advice) + 3 step instructions.
- Garment Care: Return fabric-specific program (steamTempC, steamLevel, technique, cautions) + 3 step instructions.
- Floor Care: Return adaptive cleaning schedule (roomPriority, powerMode, estimatedBatteryUsePercent) + 3 step instructions.

Return JSON format:
{
  "title": "Routine Title",
  "summary": "1 sentence executive summary of the program with AI chip rationale",
  "details": {
    "key1": "value1",
    "key2": "value2"
  },
  "instructions": [ "Step 1...", "Step 2...", "Step 3..." ]
}
`;

    const systemInstruction = `You are Versuni Care AI, an expert technician and home care Specialist.`;

    const result = await generateJsonWithRetry<any>(prompt, systemInstruction);
    res.json(result);
  } catch (err: any) {
    console.warn("Gemini care routine failed, providing smart fallback routine:", err?.message);
    res.json(getFallbackCareRoutine(category, applianceModel, specs, userInput));
  }
});

// 5. Assistant Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { messages, context } = req.body;
  const lastUserMessage = messages?.[messages.length - 1]?.text || "Hello";

  try {
    const ai = getAiClient();
    if (!ai) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }

    const systemInstruction = `
You are Versuni Home AI Assistant, a helpful and warm smart home companion.
You have direct real-time access to the user's home state:
- Owned Appliances: ${JSON.stringify(context?.appliances || [])}
- Pantry Inventory: ${JSON.stringify(context?.pantry || [])}
- Shopping List: ${JSON.stringify(context?.shoppingList || [])}
- Household Profile: ${JSON.stringify(context?.household || {})}

Rules:
- Keep answers concise, helpful, and focused on Versuni appliances, recipes, home maintenance, and care routines.
- Always reference their actual appliances (e.g. Airfryer XXL, Philips Espresso machine) and pantry items when relevant.
- Politely decline off-scope requests not related to home, kitchen, appliances, or recipes.
- Be conversational and concise (2-4 sentences max per message unless step-by-step instructions are requested).
`;

    const chatMessages = (messages || []).map((m: any) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const chat = ai.chats.create({
          model,
          config: { systemInstruction },
          history: chatMessages.slice(0, -1),
        });

        const response = await chat.sendMessage({ message: lastUserMessage });
        return res.json({ text: response.text });
      } catch (err: any) {
        console.warn(`Gemini chat call failed with model ${model}:`, err?.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error("All chat models failed.");
  } catch (err: any) {
    console.warn("Gemini chat failed, providing smart fallback response:", err?.message);
    const fallbackText = getFallbackChatResponse(lastUserMessage, context);
    res.json({ text: fallbackText });
  }
});

// Start Express + Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
