const fastify = require('fastify')();
const fs = require('fs'); // Node.js file system module
const { performance } = require('perf_hooks'); // For measuring performance
const path = require('path'); // For handling file paths

fastify.register(require('@fastify/cors'), {
  origin: '*',
});

const recentSessions = new Map();
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Video streaming endpoint
// Handles HTTP Range requests for efficient video streaming and seeking
fastify.get('/video/:filename', async (request, reply) => {
  // Get session ID from query param
  const sessionId = request.query.session;
  if (sessionId) {
    recentSessions.set(sessionId, Date.now());
  }

  // Clean up old sessions
  for (const [sid, lastSeen] of recentSessions) {
    if (Date.now() - lastSeen > SESSION_TIMEOUT) {
      recentSessions.delete(sid);
    }
  }

  // Performance monitoring (optional, for debugging/memory profiling)
  const memBefore = process.memoryUsage().heapUsed;
  const timeBefore = performance.now();

  // Build the absolute path to the requested video file
  const videoPath = path.join(__dirname, 'assets', request.params.filename);

  let stat;
  try {
    // Get file stats (size, modification time, etc.)
    stat = await fs.promises.stat(videoPath);
  } catch (err) {
    // File not found or inaccessible
    reply.code(404).send("Video not found");
    return;
  }

  const fileSize = stat.size;
  const range = request.headers.range; // Range header sent by browser for partial content

  // Set cache headers for client-side and CDN caching
  // Cache-Control: public, max-age=31536000 allows caching for 1 year
  reply.header('Cache-Control', 'public, max-age=31536000');
  // ETag header for cache validation (based on file size and modification time)
  const etag = `"${stat.size}-${stat.mtime.getTime()}"`;
  reply.header('ETag', etag);

  // If client cache matches, return 304 Not Modified (saves bandwidth)
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send();
    return;
  }

  // Default values for full file
  let start = 0;
  let end = fileSize - 1;
  let status = 200;
  let chunkSize = fileSize;
  let stream;

  // If Range header is present, parse it for partial content (seeking/streaming)
  if (range) {
    // Example: Range: bytes=1000-2000
    const parts = range.replace(/bytes=/, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    chunkSize = (end - start) + 1;
    status = 206; // HTTP 206 Partial Content

    // Validate range to prevent invalid or malicious requests
    if (start >= fileSize || end >= fileSize) {
      reply
        .code(416) // Range Not Satisfiable
        .header('Content-Range', `bytes */${fileSize}`)
        .send();
      return;
    }

    // Set headers for partial content
    reply
      .header('Content-Range', `bytes ${start}-${end}/${fileSize}`)
      .header('Accept-Ranges', 'bytes')
      .header('Content-Length', chunkSize)
      .header('Content-Type', 'video/mp4');
      // Create a readable stream for the requested video segment
      stream = fs.createReadStream(videoPath, { start, end });
  } else {
    // Set headers for full file
    reply
      .header('Content-Length', fileSize)
      .header('Content-Type', 'video/mp4')
      .header('Accept-Ranges', 'bytes');
      stream = fs.createReadStream(videoPath);
  }

  // Error handling for file stream
  stream.on('error', (err) => {
    console.error('Stream error:', err);
    // Respond with 500 Internal Server Error if streaming fails
    reply.code(500).send();
  });

  // Log memory and time usage when streaming ends (optional)
  stream.on('end', () => {
    const memAfter = process.memoryUsage().heapUsed;
    const timeAfter = performance.now();
    const memDiffMB = (memAfter - memBefore) / 1024 / 1024;
    console.log(`Memory used: ${memDiffMB.toFixed(3)} MB${memDiffMB < 0 ? ' (memory freed)' : ''}`);
    console.log(`Time: ${timeAfter - timeBefore} ms`);
  });

  console.log(`Unique sessions in last 5 min: ${recentSessions.size}`);
  // Send the stream to the client; Fastify handles piping and connection closing
  return reply.code(status).send(stream);
});

const { exec } = require('child_process');
setInterval(() => {
  exec('lsof -p ' + process.pid + ' | wc -l', (err, stdout) => {
    const fdCount = parseInt(stdout);
    if (fdCount > 900) {
      console.warn('Approaching file descriptor limit!');
    }
  });
}, 10000);

// Start server
// Start the Fastify server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info(`Server listening on http://localhost:3000`);
    console.log(`Server listening on http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Limitations and their solutions:

  // - Disk I/O
    // - Efficient Storage using SSDs and optimized file systems for fast access
    // - CDN: helps with Disk I/O limitations on the origin server.
      // When a CDN caches and serves video files from edge locations,
      // most user requests are handled by the CDN’s servers
      // This means that origin servers experience far fewer disk reads,
      // reducing their Disk I/O load.
    // - Replication: Popular content is replicated across multiple servers and
      // locations to distribute load.

  // - Network Bandwidth
    // - CDN (Content Delivery Network): use CDNs (like Open Connect) to cache
      // and serve video close to users, reducing load on origin servers.
    // - Edge Caching: Popular content is cached at edge locations.
    // - Adaptive Bitrate Streaming: is a technique where the video is encoded at
      // multiple quality levels (bitrates). The client (browser/app) automatically
      // switches between these streams based on the user’s network speed and device
      // capability, ensuring smooth playback.

  // - Concurrency
    // - Connection Limits: Limit concurrent streams per server.
    // - Clustering: Use Node.js clustering or Kubernetes to scale horizontally.
    // - Monitoring: Monitor open file descriptors and memory usage. 

  // - Resume Support & Partial Downloads
    // - Efficient Range Handling: Support HTTP Range requests (your code does this).
    // - Queueing: Queue requests if too many are active.
    // - Graceful Degradation: Return 503 if overloaded.

  // CPU & Memory
    // - Offload Transcoding: Use dedicated services for transcoding.
    // - Horizontal Scaling: Distribute load across many servers.

// Definitions:
  // - Live transcoding:
    // is the process of Real-time conversion of a video stream from one format or quality
    // to multiple others. This allows viewers with different devices
    // and network speeds to watch the same live stream at different qualities.
  // - Connection Limits:
    // It's possible to track the number of client connections by:
      // - WebSockets
      // - Session/Cookie