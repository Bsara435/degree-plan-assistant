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


    // B. Extract Text (Same API as before)
    const data = await pdf(req.file.buffer);
    const transcriptText = data.text;

    const cleanedTranscript = transcriptText
      .replace(/Page : \d+ of \d+/g, "") // Remove page numbers
      .replace(/Term Totals :[\s\S]*?Career Totals :[\s\S]*?\d+\.\d+/g, "") // Remove totals rows
      .replace(/\n\s*\n/g, "\n"); // Remove empty lines
    
    console.log(`Original Length: ${transcriptText.length} -> Cleaned Length: ${cleanedTranscript.length}`);
    // C. Prepare Data for Voiceflow
    const userPlan = req.body.userPlan || "Check my plan.";
    const userID = req.body.userID || "default_user";

    // D. Call Voiceflow
    const vfResponse = await axios.post(
      `https://general-runtime.voiceflow.com/state/user/${userID}/interact`,
      {
        action: { type: 'text', payload: userPlan + cleanedTranscript },
        config: { tts: false },
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