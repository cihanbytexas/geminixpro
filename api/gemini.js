const axios = require("axios");

// Kullanıcı bazlı chat history
let chatHistory = {};
const MAX_HISTORY = 20;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, user_name, personality } = req.body;

  if (!message || !user_name) {
    return res.status(400).json({ error: "Message and user_name are required." });
  }

  if (!chatHistory[user_name]) chatHistory[user_name] = [];

  // Personality: JSON'dan al, yoksa default kullan
  const personalityText = personality || 
    `Sen EnForce Discord botusun. Kullanıcı adı: ${user_name}. Dostane, yardımsever ve gerektiğinde hafif sarkastik ol. Komutlar ve hata çözümü hakkında bilgi ver.`;

  let historyText = chatHistory[user_name]
    .map(c => `User: ${c.user}\nBot: ${c.bot}`)
    .join("\n");
  if (historyText) historyText += "\n";

  const payload = {
    contents: [
      {
        parts: [{ text: `${personalityText}\n${historyText}User: ${message}` }],
        role: "user"
      }
    ]
  };

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    const textOutput = response.data.candidates[0].content.parts[0].text;

    chatHistory[user_name].push({ user: message, bot: textOutput });
    if (chatHistory[user_name].length > MAX_HISTORY) chatHistory[user_name].shift();

    res.status(200).json({
      response: textOutput,
      history: chatHistory[user_name]
    });

  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
};
