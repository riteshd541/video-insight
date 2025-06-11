import React, { useState } from "react";
import axios from "axios";
import "./VideoForm.css";

export default function VideoForm() {
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSummarize, setLoadingSummarize] = useState(false);
  const [loadingOpenAI, setLoadingOpenAI] = useState(false);

  const videoLinks = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
    "https://www.youtube.com/watch?v=jJfGx4G8tjo",
    "https://www.youtube.com/watch?v=arj7oStGLkU",
    "https://www.youtube.com/watch?v=W6NZfCO5SIk",
    "https://www.youtube.com/watch?v=cNfINi5CNbY",
  ];

  const handleSummarize = async () => {
    setError("");
    setSummary("");
    setLoadingSummarize(true);
    try {
      const res = await axios.post(
        "https://video-insight-jyba.onrender.com/api/youtube/summarize-basic",
        { url }
      );
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Summarization failed");
    } finally {
      setLoadingSummarize(false);
    }
  };

  const handleSummarizeOpenAI = async () => {
    setError("");
    setSummary("");
    setLoadingOpenAI(true);
    try {
      const res = await axios.post(
        "https://video-insight-jyba.onrender.com/api/youtube/summarize",
        { url }
      );
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Summarization failed");
    } finally {
      setLoadingOpenAI(false);
    }
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    setError("");
    setVideoData(null);
    setSummary("");
    setLoadingFetch(true);

    try {
      const res = await axios.post(
        "https://video-insight-jyba.onrender.com/api/youtube/metadata",
        { url }
      );
      setVideoData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingFetch(false);
    }
  };

  return (
    <div className="video-form-parent-container">
      <div className="video-form-container">
        <form onSubmit={handleFetch}>
          <input
            type="text"
            placeholder="Paste YouTube URL here"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
              setVideoData(null);
              setSummary("");
            }}
          />
          {loadingFetch ? (
            <div className="spinner"></div>
          ) : (
            <button type="submit">Fetch Video Info</button>
          )}
        </form>

        {videoData && (
          <>
            <div className="video-info">
              <img src={videoData.thumbnail} alt="Video thumbnail" />
              <h3>{videoData.title}</h3>
              <p>Duration: {videoData.duration}</p>
            </div>
            <div>
              {loadingOpenAI ? (
                <div className="spinner"></div>
              ) : (
                <button
                  style={{ margin: "1rem auto", display: "flex" }}
                  type="button"
                  onClick={handleSummarizeOpenAI}
                >
                  Summarize using OpenAI
                </button>
              )}
              {loadingSummarize ? (
                <div className="spinner"></div>
              ) : (
                <button
                  style={{ margin: "1rem auto", display: "flex" }}
                  type="button"
                  onClick={handleSummarize}
                >
                  Summarize
                </button>
              )}
            </div>
          </>
        )}
        {error && <p className="error">{error}</p>}

        {summary && (
          <div className="video-summary">
            <h3>Summary</h3>
            <p>{summary}</p>
          </div>
        )}
      </div>

      <div>
        <h1>Video Links for Testing</h1>
        <p>
          Providing some YouTube links for testing since most of the videos on
          YouTube are not available for caption generation.
        </p>
        <ul>
          {videoLinks.map((link, index) => (
            <li key={index}>
              <a href={link} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
