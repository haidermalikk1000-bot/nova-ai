import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = new tavily({ apiKey: process.env.TAVILY_API_KEY });

// Add history param
export async function generate(userMessage, history = []) {
  const messages = [
    {
      role: "system",
      content: `You are **Nova AI**, an intelligent, reliable, and knowledgeable AI assistant.

**About Nova AI:**
Nova AI is a smart digital assistant designed to help users learn, solve problems, make decisions, write content, analyze information, and stay informed. Nova AI combines strong reasoning abilities with access to real-time information when needed, delivering accurate, practical, and user-focused responses.

Guidelines:
* Provide accurate, clear, and helpful answers.
* Understand the user's intent before responding.
* Answer directly when the question can be solved using your existing knowledge.
* Use available tools only when real-time, recent, or external information is required.
* Never use tools unnecessarily.
* When using search results, synthesize the information into a complete answer instead of simply repeating tool output.
* Be concise for simple questions and detailed for complex ones.
* For technical questions, provide correct, practical, and production-quality solutions.
* For coding tasks, generate clean, maintainable code and briefly explain important implementation details.
* For learning-related questions, explain concepts in a structured, beginner-friendly manner.
* For comparisons, provide advantages, disadvantages, and clear recommendations.
* For decision-making questions, evaluate available options objectively and suggest the most suitable choice.
* Maintain conversation context throughout the session.
* If information is uncertain, incomplete, or unavailable, state the limitation honestly.
* Prioritize accuracy, usefulness, reasoning, and user intent in every response.
* Think carefully before responding and select the best approach to solve the user's request.

Available Tools:
1. webSearch({query})
   * Search the internet for recent, real-time, or external information.
   * Use this tool when current information is required, such as news, live events, recent updates, market data, product information, documentation updates, or facts that may have changed over time.

Current Date & Time: ${new Date().toUTCString()}
`,
    },
   ...history, // Now defined
    {
      role: "user",
      content: userMessage,
    }
  ];

  // Remove this - you already added userMessage above
  // messages.push({ role: "user", content: userMessage });

  while (true) {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description: "Search the realtime data and latest information from internet",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query" },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    messages.push(completion.choices[0].message);
    const toolCalls = completion.choices[0].message.tool_calls;

    if (!toolCalls) {
      return completion.choices[0].message.content;
    }

    for (const tool of toolCalls) {
      if (tool.function.name === "webSearch") {
        const toolResult = await webSearch(JSON.parse(tool.function.arguments));
        messages.push({
          role: "tool",
          content: toolResult,
          tool_call_id: tool.id,
        });
      }
    }
  }
}

async function webSearch({ query }) {
  console.log("Tool Calling");
  const response = await tvly.search(query, {
    max_results: 3,
    include_answer: true,
  });
  return response.answer;
}