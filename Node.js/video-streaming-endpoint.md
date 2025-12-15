---

# Node.js Video Streaming Endpoint: Client & Server Aspects

This document explains how to build a robust video streaming solution in Node.js, referencing the `video-stream` project. We'll cover both client and server code, iteratively improving the implementation to address caching, security, error handling, concurrency, and more.

---

## 1. Client-Side: Video Streaming with React

The client uses a React component to stream video from the backend. The browser's `<video>` element handles buffering, seeking, and playback natively, making use of HTTP Range requests for efficient streaming.

### Initial VideoPlayer Implementation

```tsx
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// VideoPlayer streams video from the backend using a <video> element.
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
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100vw", height: "100vh", margin: 0, position: "fixed", top: 0, left: 0, background: "black" }}>
      {/*
        The <video> element streams video from the backend.
        - src: URL to the backend video endpoint
        - controls: shows playback controls
        - style: makes the video fill the viewport and keeps aspect ratio
      */}
      <video
        src={`http://localhost:3000/video/${filename}?session=${sessionId}`}
        controls
        style={{ width: "100vw", height: "100vh", objectFit: "contain", background: "black" }}
      />
    </main>
  );
};
```

**Key Points:**

- The browser handles HTTP Range requests for efficient streaming and seeking.
- The session ID is used for tracking and analytics.
- WebSocket is set up for potential real-time features (e.g., analytics, chat, or connection monitoring).

---

## 2. Server-Side: Basic Video Streaming Endpoint

The server exposes an endpoint that supports HTTP Range requests, allowing the client to stream and seek video efficiently.

### Initial Fastify Endpoint

```js
const fastify = require('fastify')();
const fs = require('fs');
const path = require('path');

fastify.register(require('@fastify/cors'), { origin: '*' });

fastify.get('/video/:filename', async (request, reply) => {
  const videoPath = path.join(__dirname, 'assets', request.params.filename);
  let stat;
  try {
    stat = await fs.promises.stat(videoPath);
  } catch (err) {
    reply.code(404).send("Video not found");
    return;
  }
  const fileSize = stat.size;
  const range = request.headers.range;
  let start = 0;
  let end = fileSize - 1;
  let status = 200;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;
    status = 206;
    if (start >= fileSize || end >= fileSize) {
      reply.code(416).header('Content-Range', `bytes */${fileSize}`).send();
      return;
    }
    reply.code(status).header('Content-Range', `bytes ${start}-${end}/${fileSize}`).header('Accept-Ranges', 'bytes').header('Content-Length', (end - start) + 1).header('Content-Type', 'video/mp4');
  } else {
    reply.code(status).header('Content-Length', fileSize).header('Content-Type', 'video/mp4').header('Accept-Ranges', 'bytes');
  }
  const stream = fs.createReadStream(videoPath, { start, end });
  stream.on('error', (err) => {
    reply.code(500).send();
  });
  return reply.send(stream);
});
```

**Key Points:**

- Supports HTTP Range requests for efficient streaming and seeking.
- Handles file not found and stream errors.
- CORS is enabled for development.

---

Next, we'll iteratively improve this implementation by addressing caching, security, error handling, concurrency, and more, as discussed in the project comments.
    }
    
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes'
    });
    
    fs.createReadStream(videoPath).pipe(res);
  });
});

// 3. Handle client disconnect
app.get('/video/:filename', (req, res) => {
  const videoPath = path.join(__dirname, 'videos', req.params.filename);
  const stream = fs.createReadStream(videoPath);
  
  // Clean up on client disconnect
  req.on('close', () => {
    console.log('Client disconnected, stopping stream');
    stream.destroy();
  });
  
  stream.pipe(res);
});
```

---

### 2. How to Support Range Requests

**Explanation:**
Range requests allow clients to request specific byte ranges, enabling video seeking and resume functionality.

**Range header format**: `Range: bytes=start-end`

**Response**: 206 Partial Content with `Content-Range` header

**Exercise:**
```javascript
const fs = require('fs');
const express = require('express');
const app = express();

app.get('/video/:filename', (req, res) => {
  const videoPath = path.join(__dirname, 'videos', req.params.filename);
  
  fs.stat(videoPath, (err, stat) => {
    if (err) {
      return res.status(404).send('Video not found');
    }
    
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      // Validate range
      if (start >= fileSize || end >= fileSize) {
        res.writeHead(416, {
          'Content-Range': `bytes */${fileSize}`
        });
        return res.end();
      }
      
      // Send partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      });
      
      const stream = fs.createReadStream(videoPath, { start, end });
      stream.pipe(res);
    } else {
      // Send full file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes'
      });
      
      fs.createReadStream(videoPath).pipe(res);
    }
  });
});

app.listen(3000);
```

---

### 3. Chunked Responses vs Full File Reads

**Explanation:**
**Chunked responses**: Stream data in small chunks as it's read
**Full file reads**: Load entire file into memory before sending

**Comparison**:

| Aspect | Chunked (Streaming) | Full File Read |
|--------|---------------------|----------------|
| Memory | Low (only chunk in memory) | High (entire file) |
| Speed | Fast TTFB | Slow TTFB |
| Scalability | High | Low |
| Use case | Large files, videos | Small files |

**Exercise:**
```javascript
// Bad: Full file read
app.get('/video-bad', async (req, res) => {
  const data = await fs.promises.readFile('video.mp4'); // Loads entire file!
  res.send(data); // Memory spike!
});

// Good: Streaming
app.get('/video-good', (req, res) => {
  fs.createReadStream('video.mp4').pipe(res); // Chunks!
});

// 2. Measure memory usage
const { performance } = require('perf_hooks');

app.get('/video-measure', (req, res) => {
  const memBefore = process.memoryUsage().heapUsed;
  const timeBefore = performance.now();

  const stream = fs.createReadStream('video.mp4');

  stream.on('end', () => {
    const memAfter = process.memoryUsage().heapUsed;
    const timeAfter = performance.now();

    console.log(`Memory used: ${(memAfter - memBefore) / 1024 / 1024} MB`);
    console.log(`Time: ${timeAfter - timeBefore} ms`);
  });

  stream.pipe(res);
});
```

---

### 4. Streams: fs.createReadStream

**Explanation:**
`fs.createReadStream()` creates a readable stream for files.

**Options**:
- `start`: Starting byte position
- `end`: Ending byte position
- `highWaterMark`: Chunk size (default 64KB)
- `encoding`: Text encoding (default: Buffer)

**Exercise:**
```javascript
// 1. Basic usage
const stream = fs.createReadStream('video.mp4');
stream.pipe(res);

// 2. With options
const stream = fs.createReadStream('video.mp4', {
  start: 0,
  end: 1024 * 1024, // First 1MB
  highWaterMark: 64 * 1024 // 64KB chunks
});

// 3. Handle events
const stream = fs.createReadStream('video.mp4');

stream.on('open', () => {
  console.log('Stream opened');
});

stream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes`);
});

stream.on('end', () => {
  console.log('Stream ended');
});

stream.on('error', (err) => {
  console.error('Stream error:', err);
});

stream.on('close', () => {
  console.log('Stream closed');
});

// 4. Control flow
const stream = fs.createReadStream('video.mp4');

stream.on('data', (chunk) => {
  const canContinue = res.write(chunk);

  if (!canContinue) {
    stream.pause(); // Pause reading
  }
});

res.on('drain', () => {
  stream.resume(); // Resume reading
});

stream.on('end', () => {
  res.end();
});

// 5. Custom chunk size
const stream = fs.createReadStream('video.mp4', {
  highWaterMark: 256 * 1024 // 256KB chunks (larger for video)
});
```

---

### 5. When to Return 206 Partial Content

**Explanation:**
Return **206 Partial Content** when:
- Client sends `Range` header
- Range is valid
- Server supports range requests

Return **200 OK** when:
- No `Range` header
- Invalid range (return 416 instead)
- Server doesn't support ranges

**Exercise:**
```javascript
app.get('/video', (req, res) => {
  const videoPath = 'video.mp4';
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Case 1: No range header → 200 OK
  if (!range) {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes' // Advertise support
    });
    return fs.createReadStream(videoPath).pipe(res);
  }

  // Case 2: Parse range
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  // Case 3: Invalid range → 416 Range Not Satisfiable
  if (start >= fileSize || end >= fileSize || start > end) {
    res.writeHead(416, {
      'Content-Range': `bytes */${fileSize}`
    });
    return res.end();
  }

  // Case 4: Valid range → 206 Partial Content
  const chunkSize = (end - start) + 1;
  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': 'video/mp4'
  });

  fs.createReadStream(videoPath, { start, end }).pipe(res);
});
```

---

### 6. Handling Large Files Efficiently

**Explanation:**
Best practices for large file handling:
- Always use streams (never load into memory)
- Set appropriate chunk sizes
- Handle backpressure
- Clean up on errors/disconnect
- Use caching headers
- Consider CDN for static files

**Exercise:**
```javascript
// 1. Efficient large file handler
function streamLargeFile(filePath, req, res) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Set cache headers
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.setHeader('ETag', `"${stat.size}-${stat.mtime.getTime()}"`);

  // Check cache
  if (req.headers['if-none-match'] === res.getHeader('ETag')) {
    res.writeHead(304);
    return res.end();
  }

  let start = 0;
  let end = fileSize - 1;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : end;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': (end - start) + 1,
      'Content-Type': 'video/mp4'
    });
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes'
    });
  }

  // Stream with larger chunks for video
  const stream = fs.createReadStream(filePath, {
    start,
    end,
    highWaterMark: 512 * 1024 // 512KB chunks
  });

  // Handle errors
  stream.on('error', (err) => {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.writeHead(500);
    }
    res.end();
  });

  // Clean up on disconnect
  req.on('close', () => {
    stream.destroy();
  });

  stream.pipe(res);
}

// 2. Monitor performance
function streamWithMetrics(filePath, res) {
  const start = Date.now();
  let bytesStreamed = 0;

  const stream = fs.createReadStream(filePath);

  stream.on('data', (chunk) => {
    bytesStreamed += chunk.length;
  });

  stream.on('end', () => {
    const duration = Date.now() - start;
    const mbps = (bytesStreamed / 1024 / 1024) / (duration / 1000);
    console.log(`Streamed ${bytesStreamed} bytes in ${duration}ms (${mbps.toFixed(2)} MB/s)`);
  });

  stream.pipe(res);
}
```

---

### 7. Limitations

**Explanation:**
Node.js streaming limitations:

**Memory**:
- Each stream uses memory for buffers
- Too many concurrent streams = memory issues
- Solution: Limit concurrent connections

**Concurrency**:
- File descriptor limits (ulimit)
- CPU bottleneck for many streams
- Solution: Use clustering, load balancing

**Disk I/O**:
- Disk read speed is bottleneck
- Solution: Use SSD, caching, CDN

**Network**:
- Bandwidth limits
- Solution: CDN, compression

**Exercise:**
```javascript
// 1. Limit concurrent streams
const activeStreams = new Set();
const MAX_CONCURRENT_STREAMS = 100;

app.get('/video', (req, res) => {
  if (activeStreams.size >= MAX_CONCURRENT_STREAMS) {
    return res.status(503).send('Too many concurrent streams');
  }

  const stream = fs.createReadStream('video.mp4');
  activeStreams.add(stream);

  stream.on('close', () => {
    activeStreams.delete(stream);
  });

  stream.pipe(res);
});

// 2. Monitor file descriptors
const { exec } = require('child_process');

setInterval(() => {
  exec('lsof -p ' + process.pid + ' | wc -l', (err, stdout) => {
    const fdCount = parseInt(stdout);
    console.log(`Open file descriptors: ${fdCount}`);

    if (fdCount > 900) { // ulimit is usually 1024
      console.warn('Approaching file descriptor limit!');
    }
  });
}, 10000);

// 3. Implement queue for high load
const queue = [];
const PROCESSING_LIMIT = 50;
let processing = 0;

function queueStream(req, res, filePath) {
  if (processing < PROCESSING_LIMIT) {
    processStream(req, res, filePath);
  } else {
    queue.push({ req, res, filePath });
  }
}

function processStream(req, res, filePath) {
  processing++;

  const stream = fs.createReadStream(filePath);

  stream.on('close', () => {
    processing--;

    // Process next in queue
    if (queue.length > 0) {
      const next = queue.shift();
      processStream(next.req, next.res, next.filePath);
    }
  });

  stream.pipe(res);
}
```

---

### 8. How CDNs Help Scale Streaming

**Explanation:**
**CDNs (Content Delivery Networks)** cache and serve content from edge locations closer to users.

**Benefits**:
- Reduced latency (geographic proximity)
- Reduced origin server load
- Better bandwidth
- DDoS protection
- Automatic scaling

**How it works**:
1. User requests video
2. CDN checks cache
3. If cached: serve from edge
4. If not: fetch from origin, cache, serve

**Popular CDNs**: CloudFront, Cloudflare, Fastly, Akamai

**Exercise:**
```javascript
// 1. Set CDN-friendly headers
app.get('/video/:id', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  res.setHeader('CDN-Cache-Control', 'max-age=86400'); // 1 day on CDN
  res.setHeader('Vary', 'Accept-Encoding');

  // Serve video
  fs.createReadStream(`videos/${req.params.id}.mp4`).pipe(res);
});

// 2. Implement cache invalidation
const AWS = require('aws-sdk');
const cloudfront = new AWS.CloudFront();

async function invalidateCDNCache(videoId) {
  await cloudfront.createInvalidation({
    DistributionId: 'YOUR_DISTRIBUTION_ID',
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: 1,
        Items: [`/video/${videoId}.mp4`]
      }
    }
  }).promise();
}

// 3. Signed URLs for private content
function generateSignedUrl(videoId, expiresIn = 3600) {
  const signer = new AWS.CloudFront.Signer(
    process.env.CLOUDFRONT_KEY_PAIR_ID,
    process.env.CLOUDFRONT_PRIVATE_KEY
  );

  const url = `https://cdn.example.com/video/${videoId}.mp4`;
  const expires = Math.floor(Date.now() / 1000) + expiresIn;

  return signer.getSignedUrl({
    url,
    expires
  });
}

// 4. Origin server with CDN
app.get('/video/:id', (req, res) => {
  // Check if request is from CDN
  const cdnHeader = req.headers['cloudfront-viewer-country'];

  if (cdnHeader) {
    console.log('Request from CDN');
  }

  // Serve video
  fs.createReadStream(`videos/${req.params.id}.mp4`).pipe(res);
});
```

