import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback intelligent goal breakdown if AI key is unavailable or fails
function getHeuristicBreakdown(goal: string) {
  const lower = goal.toLowerCase();

  if (
    lower.includes("project") ||
    lower.includes("deliver") ||
    lower.includes("milestone") ||
    lower.includes("client") ||
    lower.includes("quarter") ||
    lower.includes("release") ||
    lower.includes("feature") ||
    lower.includes("ship")
  ) {
    return {
      stages: [
        {
          name: "Scope & Align",
          actions: [
            { title: "Draft clear deliverable specs and acceptance criteria", estimatedMinutes: 30 },
            { title: "Confirm resource allocation and cross-team dependencies", estimatedMinutes: 25 },
          ],
        },
        {
          name: "Build",
          actions: [
            { title: "Draft presentation deck & core deliverables", estimatedMinutes: 45 },
            { title: "Review priority blocker tickets with collaborators", estimatedMinutes: 30 },
          ],
        },
        {
          name: "Refine",
          actions: [
            { title: "Incorporate feedback from stakeholder walkthrough", estimatedMinutes: 25 },
            { title: "Execute edge-case validation and quality checklist", estimatedMinutes: 35 },
          ],
        },
        {
          name: "Ship",
          actions: [
            { title: "Deploy release package and notify key stakeholders", estimatedMinutes: 30 },
            { title: "Host brief team retrospective to document key takeaways", estimatedMinutes: 20 },
          ],
        },
      ],
    };
  }

  if (lower.includes("operations") || lower.includes("workflow") || lower.includes("process") || lower.includes("automate")) {
    return {
      stages: [
        {
          name: "Audit",
          actions: [
            { title: "Map current time sinks and recurring manual tasks", estimatedMinutes: 30 },
            { title: "Identify top 2 bottlenecks creating friction", estimatedMinutes: 20 },
          ],
        },
        {
          name: "Standardize",
          actions: [
            { title: "Draft reusable checklist and documentation template", estimatedMinutes: 30 },
            { title: "Publish clear team guidelines for new workflow", estimatedMinutes: 25 },
          ],
        },
        {
          name: "Automate",
          actions: [
            { title: "Set up automated reminders or system integrations", estimatedMinutes: 30 },
          ],
        },
        {
          name: "Review",
          actions: [
            { title: "Evaluate weekly time saved and make adjustments", estimatedMinutes: 20 },
          ],
        },
      ],
    };
  }

  if (lower.includes("exam") || lower.includes("study") || lower.includes("course") || lower.includes("learn") || lower.includes("test")) {
    return {
      stages: [
        {
          name: "Understand",
          actions: [
            { title: "Review core curriculum and primary reference material", estimatedMinutes: 45 },
            { title: "Summarize fundamental principles in your own words", estimatedMinutes: 30 },
            { title: "Identify complex areas requiring deeper clarification", estimatedMinutes: 20 },
          ],
        },
        {
          name: "Practise",
          actions: [
            { title: "Complete hands-on practical exercises", estimatedMinutes: 40 },
            { title: "Solve realistic scenario and assessment questions", estimatedMinutes: 50 },
          ],
        },
        {
          name: "Review",
          actions: [
            { title: "Review errors and build quick reference notes", estimatedMinutes: 25 },
            { title: "Self-test weak areas without referencing source notes", estimatedMinutes: 35 },
          ],
        },
        {
          name: "Assess",
          actions: [
            { title: "Complete timed simulation or final evaluation", estimatedMinutes: 60 },
            { title: "Rest and synthesize learnings for practical application", estimatedMinutes: 15 },
          ],
        },
      ],
    };
  }

  if (lower.includes("exercise") || lower.includes("workout") || lower.includes("fitness") || lower.includes("run") || lower.includes("gym") || lower.includes("health")) {
    return {
      stages: [
        {
          name: "Plan",
          actions: [
            { title: "Choose a realistic 3-day weekly routine", estimatedMinutes: 20 },
            { title: "Prepare workout gear and water bottle", estimatedMinutes: 10 },
          ],
        },
        {
          name: "Start",
          actions: [
            { title: "Complete first gentle 20-minute session", estimatedMinutes: 20 },
            { title: "Log how your body feels after session 1", estimatedMinutes: 5 },
          ],
        },
        {
          name: "Train",
          actions: [
            { title: "Execute scheduled workout session", estimatedMinutes: 45 },
            { title: "Track completed reps and distances", estimatedMinutes: 5 },
          ],
        },
        {
          name: "Recover",
          actions: [
            { title: "10-minute full body stretch & hydration", estimatedMinutes: 15 },
            { title: "Ensure 8 hours of restorative sleep", estimatedMinutes: 10 },
          ],
        },
        {
          name: "Review",
          actions: [
            { title: "Evaluate weekly consistency and adjust weight/intensity", estimatedMinutes: 15 },
          ],
        },
      ],
    };
  }

  if (lower.includes("business") || lower.includes("launch") || lower.includes("product") || lower.includes("startup") || lower.includes("sell")) {
    return {
      stages: [
        {
          name: "Idea",
          actions: [
            { title: "Clarify the specific problem being solved in one sentence", estimatedMinutes: 25 },
            { title: "Identify 3 direct competitors and their gaps", estimatedMinutes: 40 },
          ],
        },
        {
          name: "Validate",
          actions: [
            { title: "Interview 5 potential target customers", estimatedMinutes: 60 },
            { title: "Confirm willingness to pay or use solution", estimatedMinutes: 30 },
          ],
        },
        {
          name: "Build",
          actions: [
            { title: "Create the minimal viable offering (MVP)", estimatedMinutes: 90 },
            { title: "Set up simple payment or intake method", estimatedMinutes: 30 },
          ],
        },
        {
          name: "Launch",
          actions: [
            { title: "Reach out to first 20 target users directly", estimatedMinutes: 45 },
            { title: "Announce on relevant social or community channel", estimatedMinutes: 20 },
          ],
        },
        {
          name: "Improve",
          actions: [
            { title: "Collect initial user feedback", estimatedMinutes: 30 },
            { title: "Fix the top point of user friction", estimatedMinutes: 45 },
          ],
        },
      ],
    };
  }

  if (lower.includes("design") || lower.includes("art") || lower.includes("draw") || lower.includes("creative") || lower.includes("skill")) {
    return {
      stages: [
        {
          name: "Learn fundamentals",
          actions: [
            { title: "Study typography, color theory, and grid hierarchy", estimatedMinutes: 45 },
            { title: "Deconstruct 3 world-class design examples", estimatedMinutes: 30 },
          ],
        },
        {
          name: "Practise",
          actions: [
            { title: "Complete 1 daily design challenge using design tools", estimatedMinutes: 40 },
            { title: "Refine keyboard shortcuts and vector precision", estimatedMinutes: 20 },
          ],
        },
        {
          name: "Recreate",
          actions: [
            { title: "Pixel-perfect recreate a reference layout you admire", estimatedMinutes: 60 },
            { title: "Compare spacing and contrast against the original", estimatedMinutes: 20 },
          ],
        },
        {
          name: "Create original work",
          actions: [
            { title: "Design an original poster, interface, or branding asset", estimatedMinutes: 90 },
            { title: "Export mockups for portfolio showcase", estimatedMinutes: 25 },
          ],
        },
        {
          name: "Review",
          actions: [
            { title: "Ask for peer critique or self-evaluate against design principles", estimatedMinutes: 20 },
            { title: "Implement top constructive adjustments", estimatedMinutes: 30 },
          ],
        },
      ],
    };
  }

  if (lower.includes("event") || lower.includes("organise") || lower.includes("club") || lower.includes("team") || lower.includes("conference") || lower.includes("party")) {
    return {
      stages: [
        {
          name: "Plan",
          actions: [
            { title: "Define event objective, date, and estimated budget", estimatedMinutes: 30 },
            { title: "Draft attendee target list", estimatedMinutes: 20 },
          ],
        },
        {
          name: "Assign",
          actions: [
            { title: "Divide core duties (logistics, promo, hospitality)", estimatedMinutes: 30 },
            { title: "Confirm deadlines with team collaborators", estimatedMinutes: 15 },
          ],
        },
        {
          name: "Prepare",
          actions: [
            { title: "Secure venue or virtual platform link", estimatedMinutes: 45 },
            { title: "Send formal invites and track RSVPs", estimatedMinutes: 30 },
          ],
        },
        {
          name: "Execute",
          actions: [
            { title: "Arrive 1 hour early for sound & space check", estimatedMinutes: 60 },
            { title: "Welcome guests and coordinate schedule transitions", estimatedMinutes: 90 },
          ],
        },
        {
          name: "Review",
          actions: [
            { title: "Send thank-you message to attendees & helpers", estimatedMinutes: 20 },
            { title: "Hold 15-minute retrospective debrief", estimatedMinutes: 15 },
          ],
        },
      ],
    };
  }

  // General default goal breakdown
  return {
    stages: [
      {
        name: "Define",
        actions: [
          { title: "Write down the exact definition of done", estimatedMinutes: 20 },
          { title: "Gather essential materials and references", estimatedMinutes: 30 },
        ],
      },
      {
        name: "Build",
        actions: [
          { title: "Create the first working draft or iteration", estimatedMinutes: 60 },
          { title: "Eliminate immediate obstacles or missing parts", estimatedMinutes: 30 },
        ],
      },
      {
        name: "Refine",
        actions: [
          { title: "Review output against original standard", estimatedMinutes: 30 },
          { title: "Polish details and test for flaws", estimatedMinutes: 45 },
        ],
      },
      {
        name: "Deliver",
        actions: [
          { title: "Ship or finalize the completed outcome", estimatedMinutes: 30 },
          { title: "Log key lessons learned for future systems", estimatedMinutes: 15 },
        ],
      },
    ],
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Smart goal-to-system AI breakdown endpoint
  app.post("/api/breakdown", async (req, res) => {
    const { goal, why, timeframe } = req.body;

    if (!goal || typeof goal !== "string") {
      res.status(400).json({ error: "Goal is required" });
      return;
    }

    const ai = getAIClient();

    if (!ai) {
      // Return heuristic system cleanly
      const heuristic = getHeuristicBreakdown(goal);
      res.json({ source: "heuristic", ...heuristic });
      return;
    }

    try {
      const prompt = `You are System Builder, an expert productivity architect.
The user wants to accomplish:
Goal: "${goal}"
${why ? `Why it matters: "${why}"` : ""}
${timeframe ? `Target timeframe: "${timeframe}"` : ""}

Transform this messy goal into a simple, elegant system workflow following the philosophy:
Goal -> System -> Actions -> Progress.

Rules:
1. Divide the system into 3 to 5 logical, sequential, linear stages.
   Stage names must be short single action-oriented verbs or nouns (e.g. "Understand", "Practise", "Review", "Test", or "Plan", "Build", "Launch", "Improve").
2. Inside each stage, provide 2 to 3 concrete, specific, actionable tasks (not vague thoughts).
3. Provide realistic estimated completion minutes (10 to 60 minutes) for each action.
4. Keep it relieving, calm, and uncluttered.`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini request timeout")), 6000)
      );

      const generatePromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stages: {
                type: Type.ARRAY,
                description: "Sequential stages of the system",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                      description: "Short stage name (1-2 words, e.g. Understand, Practise)",
                    },
                    actions: {
                      type: Type.ARRAY,
                      description: "Concrete actions to take within this stage",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: {
                            type: Type.STRING,
                            description: "Clear actionable task title",
                          },
                          estimatedMinutes: {
                            type: Type.INTEGER,
                            description: "Estimated minutes to complete (e.g. 15, 30, 45)",
                          },
                        },
                        required: ["title"],
                      },
                    },
                  },
                  required: ["name", "actions"],
                },
              },
            },
            required: ["stages"],
          },
        },
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      const text = response.text?.trim() || "";
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.stages && Array.isArray(parsed.stages) && parsed.stages.length > 0) {
          res.json({ source: "gemini", stages: parsed.stages });
          return;
        }
      }

      // Fallback if parsing failed
      res.json({ source: "heuristic", ...getHeuristicBreakdown(goal) });
    } catch (err) {
      console.error("Gemini breakdown error, falling back to heuristic:", err);
      res.json({ source: "heuristic", ...getHeuristicBreakdown(goal) });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`System Builder server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
