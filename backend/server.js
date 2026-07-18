import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { generate } from "./chatbot.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000; // FIX 1

const allowedOrigins = [
  "https://nova-ai-chatbot.netlify.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin like Postman, mobile apps
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Connect MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected");

// 3. Schema: store each chat + messages
const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'] },
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
  sessionId: { type: String, index: true }, // 5. No auth: uses UUID from frontend
  title: String,
  messages: [MessageSchema],
  updatedAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', ChatSchema);

// 1. Connect frontend: updated /chat route
app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId, chatId } = req.body;
    if (!sessionId ||!message) return res.status(400).json({ error: "Missing data" });

    let chat = chatId? await Chat.findById(chatId) : null;
    if (!chat) {
      chat = new Chat({
        sessionId,
        title: message.slice(0, 30),
        messages: []
      });
    }

    chat.messages.push({ role: 'user', content: message });

    // Pass history to LLM for context
    const history = chat.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
    const aiResponse = await generate(message, history);

    chat.messages.push({ role: 'assistant', content: aiResponse });
    chat.updatedAt = Date.now();
    await chat.save();

    res.json({ message: aiResponse, chatId: chat._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4. Get all chats for sidebar history
app.get("/chats/:sessionId", async (req, res) => {
  try {
    const chats = await Chat.find({ sessionId: req.params.sessionId })
     .sort({ updatedAt: -1 })
     .select('title _id updatedAt');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// 4. Get single chat messages
app.get("/chat/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

app.get("/", (req, res) => {
  res.send("NOVA AI");
});

app.listen(PORT, '0.0.0.0', () => { // FIX 2
  console.log(`Server running on ${PORT}`);
});
