// Cloudflare Worker for L'Oréal Chatbot (gpt-4o)
// Secure your OpenAI API key in Cloudflare dashboard under "Variables and Secrets" as OPENAI_API_KEY

export default {
  async fetch(request, env) {
    // Parse incoming request body (expects JSON with 'messages' array)
    const reqBody = await request.json();

    // Prepare OpenAI API request
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}` // Securely use secret
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: reqBody.messages
      })
    });

    // Get response from OpenAI
    const data = await openaiResponse.json();

    // Return only the assistant's reply
    return new Response(JSON.stringify({
      reply: data.choices[0].message.content
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
