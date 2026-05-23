const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

router.use(protect);

/**
 * POST /api/v1/ai/chat
 * Multi-turn AI task assistant
 */
router.post("/chat", async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "messages array required" });
    }

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: `You are a smart, concise task management assistant built into the Primetrade task app.
Help users plan tasks, prioritize work, break down projects, and be productive.
Keep responses under 150 words. Be direct, practical, and encouraging.
Do not use markdown headers. Use simple text with line breaks.`,
        },
        ...messages
          .filter((m) => m.role && m.content)
          .slice(-8), // last 8 messages for context window
      ],
    });

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/ai/suggest
 * Given a task title, suggest description and priority
 */
router.post("/suggest", async (req, res, next) => {
  try {
    console.log("AI suggest body:", req.body); // debug line
    const title = req.body?.title;
    const description = req.body?.description || "";

    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "title required" });
    }

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 250,
      messages: [
        {
          role: "system",
          content: `You are a task management AI. Given a task title, respond ONLY with valid JSON (no markdown, no explanation, no backticks) in this exact format:
{"description":"brief 1-2 sentence description of what this task involves","priority":"low|medium|high"}
Choose priority based on urgency and importance implied by the title.`,
        },
        {
          role: "user",
          content: `Task title: "${title}"${description ? `\nExisting description: "${description}"` : ""}`,
        },
      ],
    });

    let data = { description: "", priority: "medium" };
    try {
      const text = response.choices[0]?.message?.content || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      data = JSON.parse(clean);
    } catch {
      // fallback to defaults
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/ai/prioritize
 * Given a list of tasks, return prioritization advice
 */
router.post("/prioritize", async (req, res, next) => {
  try {
    const { tasks } = req.body;
    if (!tasks?.length) {
      return res.status(400).json({ success: false, message: "tasks array required" });
    }

    const taskList = tasks
      .slice(0, 10)
      .map((t, i) => `${i + 1}. [${t.priority}] ${t.title}`)
      .join("\n");

    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: "You are a productivity coach. Given a task list, provide a brief prioritization recommendation in plain text, max 100 words. Be direct and actionable.",
        },
        {
          role: "user",
          content: `Help me prioritize these tasks:\n${taskList}`,
        },
      ],
    });

    const advice = response.choices[0]?.message?.content || "";
    res.json({ success: true, data: { advice } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;