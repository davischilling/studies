import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// VideoPlayer component for streaming video from backend
//
// How it works:
// - The <video> element requests the video file from the backend server using the src URL.
// - The browser automatically sends HTTP Range headers for efficient streaming and seeking.
// - The backend responds with partial content (206) or full content (200) as needed.
// - The browser handles buffering, seeking, and playback natively.
//
// Security:
// - The video is streamed directly from the backend; CORS must be enabled on the server.
// - In production, restrict CORS to your frontend domain.
//
// Caching:
// - The backend sets Cache-Control and ETag headers for browser and CDN caching.
// - The browser will cache the video if allowed, reducing server load.
//
// Error Handling:
// - If the video is not found or the server returns an error, the <video> element will display a fallback UI.
// - You can use the onError prop to handle errors in a custom way if desired.
//
// Performance:
// - The browser streams only the needed video segments, minimizing bandwidth usage.
// - The <video> element is hardware-accelerated and optimized for performance.

const filename = "video.mp4";

export const VideoPlayer = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let sid = localStorage.getItem("sessionId");
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem("sessionId", sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const ws = new WebSocket(`ws://localhost:3001?session=${sessionId}`);
    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");
    return () => ws.close();
  }, [sessionId]);

  if (!sessionId) return null;

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh",
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
        background: "black",
      }}
    >
      {/*
        The <video> element streams video from the backend.
        - src: URL to the backend video endpoint
        - controls: shows playback controls
        - style: makes the video fill the viewport and keeps aspect ratio
        - The browser handles Range requests, caching, and playback automatically.
      */}
      <video
        src={`http://localhost:3000/video/${filename}?session=${sessionId}`}
        controls
        style={{
          width: "100vw",
          height: "100vh",
          objectFit: "contain",
          background: "black",
        }}
        // onError={e => { /* Optionally handle errors here */ }}
      />
    </main>
  );
};