/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// System prompt for L'Oréal assistant
const systemPrompt = {
  role: "system",
  content: "You are a helpful assistant for L’Oréal. Only answer questions related to L’Oréal products, beauty routines, and recommendations. If asked about anything else, politely say you can only help with L’Oréal topics."
};

// Use your deployed Cloudflare Worker URL here
const workerUrl = "https://plain-tree-17ae.yubina-acharya.workers.dev/";

// Store chat messages
let messages = [systemPrompt];

// Track user's name for context
let userName = "";

// Ask for user's name at the start
function askUserName() {
  chatWindow.innerHTML = "";
  addMessageBubble("👋 Hi! What's your name?", "ai");
}
askUserName();

/* Handle form submit */
chatForm.addEventListener("submit", async function(event) {
  event.preventDefault(); // Stop page reload

  // Get user's message
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // If we don't have the user's name yet, save it and greet them
  if (!userName) {
    userName = userMessage;
    addMessageBubble(userMessage, "user");
    addMessageBubble(`Nice to meet you, ${userName}! Ask me anything about L'Oréal products or routines.`, "ai");
    messages.push({ role: "user", content: `My name is ${userName}.` });
    userInput.value = "";
    return;
  }

  // Add user's message to messages array for conversation history
  messages.push({ role: "user", content: userMessage });

  // Display the user's question above the assistant's reply
  chatWindow.innerHTML = ""; // Clear chat for new exchange
  addMessageBubble(`${userName}: ${userMessage}`, "user");

  // Get assistant's reply
  const aiReply = await getAIResponse(messages);
  if (aiReply) {
    messages.push({ role: "assistant", content: aiReply });
    addMessageBubble(aiReply, "ai");
  }

  // Clear input box
  userInput.value = '';
});

// Function to add a message bubble to the chat window
function addMessageBubble(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${sender}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to bottom
}

// Function to call your Cloudflare Worker
async function getAIResponse(messages) {
  // Prepare request body for Worker
  const body = {
    messages: messages
  };

  try {
    // Send POST request to your Worker endpoint
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // Get the assistant's reply from Worker response
    return data.reply;
  } catch (error) {
    addMessageBubble("Sorry, there was a problem connecting to the assistant.", "ai");
    return null;
  }
}
