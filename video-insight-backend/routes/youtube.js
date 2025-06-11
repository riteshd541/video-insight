const express = require("express");
const router = express.Router();
const axios = require("axios");
const TranscriptAPI = require("youtube-transcript-api");
require("dotenv").config();

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// =========================
// Route 1: Fetch metadata
// =========================
router.post("/metadata", async (req, res) => {
  const { url } = req.body;

  try {
    const videoId = extractVideoId(url);
    if (!videoId)
      return res.status(400).json({ message: "Invalid YouTube URL" });

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(apiUrl);

    const video = response.data.items[0];
    if (!video) return res.status(404).json({ message: "Video not found" });

    const metadata = {
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.medium.url,
      duration: video.contentDetails.duration,
    };

    res.json(metadata);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch video data", error: error.message });
  }
});

// =====================================
// Route 2: Generate Summary using OpenAI
// =====================================

router.post("/summarize", async (req, res) => {
  const { url } = req.body;

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    console.log("📄 Getting transcript for:", videoId);
    const transcript = await TranscriptAPI.getTranscript(videoId);
    console.log("📄 Got transcript:", transcript);

    const transcriptText = transcript.map((line) => line.text).join(" ");
    console.log("📄 Transcript Length:", transcriptText.length);

    if (!transcriptText || transcriptText.length < 100) {
      return res
        .status(400)
        .json({ message: "Transcript too short or unavailable." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes YouTube transcripts concisely.",
        },
        {
          role: "user",
          content: `Summarize this YouTube transcript:\n${transcriptText}`,
        },
      ],
    });

    const summary = completion.choices?.[0]?.message?.content;
    if (!summary) {
      return res.status(500).json({ message: "Failed to generate summary." });
    }

    res.json({ summary });
  } catch (err) {
    console.error("🔥 Summarization error:", err.message);

    if (
      err.message.includes("video unavailable") ||
      err.message.includes("captions disabled")
    ) {
      return res
        .status(400)
        .json({ message: "This video is unavailable or has no captions." });
    }

    if (err.status === 429 || err.message.includes("quota")) {
      return res.status(429).json({
        message:
          "You have exceeded your OpenAI quota. Please check your plan and billing. You can also try to summerize the transcript manually which is free by clicking the the Summerize button.",
      });
    }

    res.status(500).json({ message: "Summarization failed" });
  }
});

// =========================
// Route 3: Get raw transcript
// =========================
router.post("/transcript", async (req, res) => {
  const { url } = req.body;

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    console.log("📄 Getting transcript for:", videoId);
    const transcript = await TranscriptAPI.getTranscript(videoId);

    const transcriptText = transcript.map((line) => line.text).join(" ");

    res.json({
      transcript: transcriptText,
      segments: transcript,
      wordCount: transcriptText.split(/\s+/).length,
      duration:
        transcript.length > 0
          ? transcript[transcript.length - 1].offset +
            transcript[transcript.length - 1].duration
          : 0,
    });
  } catch (err) {
    console.error("🔥 Transcript error:", err.message);

    if (
      err.message.includes("video unavailable") ||
      err.message.includes("captions disabled")
    ) {
      return res
        .status(400)
        .json({ message: "This video is unavailable or has no captions." });
    }

    res.status(500).json({
      message: "Failed to fetch transcript",
      error: err.message,
    });
  }
});

// =========================
// Route 4: Fallback Summary (No AI)
// =========================
router.post("/summarize-basic", async (req, res) => {
  const { url } = req.body;

  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    console.log("📄 Getting transcript for basic summary:", videoId);
    const transcript = await TranscriptAPI.getTranscript(videoId);
    const transcriptText = transcript.map((line) => line.text).join(" ");

    if (!transcriptText || transcriptText.length < 100) {
      return res
        .status(400)
        .json({ message: "Transcript too short or unavailable." });
    }

    res.json({
      summary: transcriptText,
      method: "basic_transcript",
      note: "This is the raw transcript text returned as the basic summary.",
    });
  } catch (err) {
    console.error("🔥 Basic summarization error:", err.message);
    res.status(500).json({
      message: "Basic summarization failed",
      error: err.message,
    });
  }
});

function extractVideoId(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

module.exports = router;
