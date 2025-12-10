import { createRequire } from 'module';
import axios from 'axios';

// 1. Setup 'require' for compatibility
const require = createRequire(import.meta.url);

// 2. Import the new, stable library
const pdf = require('pdf-extraction');

export const analyzeTranscript = async (req, res) => {
  try {
    // A. Validate File
    if (!req.file) {
      return res.status(400).json({ error: "No transcript file uploaded" });
    }

    console.log("📄 Processing PDF with pdf-extraction...");

    // B. Extract Text (Same API as before)
    const data = await pdf(req.file.buffer);
    const transcriptText = data.text;
    
    // Check if text extraction worked
    if (!transcriptText || transcriptText.length < 10) {
        console.warn("⚠️ Warning: Extracted text is very short or empty.");
    } else {
        console.log(`✅ Success! Extracted ${transcriptText.length} characters.`);
    }

    // C. Prepare Data for Voiceflow
    const userPlan = req.body.userPlan || "Check my plan.";
    const userID = req.body.userID || "default_user";

    // D. Call Voiceflow
    const vfResponse = await axios.post(
      `https://general-runtime.voiceflow.com/state/user/${userID}/interact`,
      {
        action: { type: 'text', payload: userPlan },
        config: { tts: false },
        variables: { user_transcript: transcriptText }
      },
      {
        headers: {
          Authorization: process.env.VOICEFLOW_API_KEY,
          versionID: 'production'
        }
      }
    );

    // E. Format Response
    const botReply = vfResponse.data
      .filter(trace => trace.type === 'text')
      .map(trace => trace.payload.message)
      .join('\n');

    res.json({ success: true, analysis: botReply });

  } catch (error) {
    console.error("❌ Controller Error:", error.message);
    res.status(500).json({ error: "Analysis failed", details: error.message });
  }
};