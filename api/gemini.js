const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, personality } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message parameter is required." });
  }

  const personalityText = personality || "Senin adın EnForce, Sen bir dıscord botusun.";

  const payload = {
    contents: [
      {
        parts: [{ text: `${personalityText}\nUser: ${message}` }],
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
    res.status(200).json({ response: textOutput });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
};
