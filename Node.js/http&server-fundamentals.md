# HTTP & Web Server Fundamentals

### 1. Creating HTTP Servers with the http Module

**Explanation:**
The `http` module provides low-level HTTP server and client functionality.

**Basic server**:
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

server.listen(3000);
```

**Key objects**:
- **`http.Server`**: The server instance
- **`http.IncomingMessage` (req)**: Readable stream with request data
- **`http.ServerResponse` (res)**: Writable stream for response

**Request properties**:
- `req.method`: HTTP method (GET, POST, etc.)
- `req.url`: Request URL
- `req.headers`: Request headers object
- `req.on('data')`: Read request body

**Response methods**:
- `res.writeHead(statusCode, headers)`: Write status and headers
- `res.setHeader(name, value)`: Set individual header
- `res.write(chunk)`: Write response body chunk
- `res.end([data])`: Finish response

**Exercise:**
```javascript
const http = require('http');
const url = require('url');

// 1. Create a basic routing server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (path === '/' && req.method === 'GET') {
    // Handle GET /
  } else if (path === '/api/users' && req.method === 'GET') {
    // Handle GET /api/users
  } else if (path === '/api/users' && req.method === 'POST') {
    // Handle POST /api/users
    // Read body from request stream
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// 2. Parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();

      // Prevent large payloads
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });

    req.on('error', reject);
  });
}

// 3. Implement request timeout
server.setTimeout(30000); // 30 seconds

server.on('timeout', (socket) => {
  socket.end('HTTP/1.1 408 Request Timeout\r\n\r\n');
});

// 4. Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use');
  } else {
    console.error('Server error:', err);
  }
});

// 5. Implement keep-alive
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // Slightly more than keepAliveTimeout

// 6. Create an HTTP client
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);

    if (data) req.write(data);
    req.end();
  });
}

// Test:
makeRequest({
  hostname: 'localhost',
  port: 3000,
  path: '/api/users',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, JSON.stringify({ name: 'John' }));

// 7. Implement connection pooling
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000
});

// Use agent for requests
http.request({ ...options, agent });
```

---

### 2. Understanding Request/Response Lifecycle

**Explanation:**
The HTTP request/response lifecycle in Node.js:

**Request Phase**:
1. Client connects to server
2. Server emits 'connection' event
3. Client sends HTTP request
4. Server parses request (method, URL, headers)
5. Server emits 'request' event → your handler called
6. Request body streams in via 'data' events
7. 'end' event signals request complete

**Response Phase**:
1. Handler processes request
2. `res.writeHead()` sends status line and headers
3. `res.write()` sends body chunks (optional, multiple calls)
4. `res.end()` signals response complete
5. Connection closed or kept alive

**Important**: Headers must be sent before body. Once `res.write()` or `res.end()` is called, headers are locked.

**Exercise:**
```javascript
// 1. Trace the lifecycle
const server = http.createServer((req, res) => {
  console.log('1. Request received');

  req.on('data', (chunk) => {
    console.log('2. Data chunk received:', chunk.length);
  });

  req.on('end', () => {
    console.log('3. Request complete');

    res.writeHead(200);
    console.log('4. Headers sent');

    res.write('Hello ');
    console.log('5. First chunk sent');

    res.end('World');
    console.log('6. Response complete');
  });
});

// 2. Handle errors at each stage
server.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

server.on('request', (req, res) => {
  req.on('error', (err) => {
    console.error('Request error:', err);
    res.statusCode = 400;
    res.end('Bad Request');
  });

  res.on('error', (err) => {
    console.error('Response error:', err);
  });

  res.on('finish', () => {
    console.log('Response finished');
  });
});

// 3. Implement request/response logging middleware
function logger(req, res, next) {
  const start = Date.now();

  // Log request
  console.log(`--> ${req.method} ${req.url}`);

  // Capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`<-- ${res.statusCode} ${duration}ms`);
    originalEnd.apply(res, args);
  };

  next();
}

// 4. Prevent header modification after sent
function safeSetHeader(res, name, value) {
  if (res.headersSent) {
    console.warn('Headers already sent, cannot modify');
    return false;
  }
  res.setHeader(name, value);
  return true;
}

// 5. Implement response timeout
function withTimeout(res, ms) {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.writeHead(504);
      res.end('Gateway Timeout');
    }
  }, ms);

  res.on('finish', () => clearTimeout(timeout));
}
```

---

### 3. Handling Streaming Responses

**Explanation:**
Streaming responses send data in chunks rather than loading everything into memory first.

**Benefits**:
- Lower memory usage
- Faster time-to-first-byte (TTFB)
- Better for large files (videos, downloads)
- Enables progressive rendering

**Implementation**:
```javascript
const fs = require('fs');

// Stream file to response
const stream = fs.createReadStream('video.mp4');
stream.pipe(res);
```

**Important**: Handle backpressure! The `pipe()` method does this automatically.

**Exercise:**
```javascript
const fs = require('fs');
const http = require('http');

// 1. Basic file streaming
http.createServer((req, res) => {
  const filePath = './large-file.mp4';

  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Length': fs.statSync(filePath).size
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);

  // Handle errors
  stream.on('error', (err) => {
    res.statusCode = 500;
    res.end('Server Error');
  });
}).listen(3000);

// 2. Manual streaming with backpressure handling
http.createServer((req, res) => {
  const stream = fs.createReadStream('file.mp4');

  stream.on('data', (chunk) => {
    const canContinue = res.write(chunk);

    if (!canContinue) {
      // Response buffer is full, pause reading
      stream.pause();

      // Resume when drained
      res.once('drain', () => stream.resume());
    }
  });

  stream.on('end', () => res.end());
  stream.on('error', (err) => {
    res.statusCode = 500;
    res.end();
  });
}).listen(3000);

// 3. Stream with progress tracking
function streamWithProgress(filePath, res) {
  const stat = fs.statSync(filePath);
  const totalSize = stat.size;
  let transferred = 0;

  const stream = fs.createReadStream(filePath);

  stream.on('data', (chunk) => {
    transferred += chunk.length;
    const percent = (transferred / totalSize * 100).toFixed(2);
    console.log(`Progress: ${percent}%`);

    res.write(chunk);
  });

  stream.on('end', () => {
    console.log('Stream complete');
    res.end();
  });
}

// 4. Implement streaming with transformation
const { Transform } = require('stream');

class EncryptTransform extends Transform {
  _transform(chunk, encoding, callback) {
    // Simple XOR encryption (example only!)
    const encrypted = Buffer.from(chunk).map(b => b ^ 0xFF);
    callback(null, encrypted);
  }
}

http.createServer((req, res) => {
  fs.createReadStream('file.mp4')
    .pipe(new EncryptTransform())
    .pipe(res);
}).listen(3000);

// 5. Handle client disconnect
http.createServer((req, res) => {
  const stream = fs.createReadStream('large-file.mp4');

  req.on('close', () => {
    console.log('Client disconnected, stopping stream');
    stream.destroy();
  });

  stream.pipe(res);
}).listen(3000);

// 6. Implement adaptive streaming
function streamWithAdaptiveQuality(req, res) {
  // Detect client bandwidth
  // Choose appropriate quality
  // Stream corresponding file

  const quality = req.headers['x-quality'] || 'medium';
  const file = `video-${quality}.mp4`;

  fs.createReadStream(file).pipe(res);
}
```

---

### 4. Implementing Partial Content Responses

**Explanation:**
**Partial content** (HTTP 206) allows clients to request specific byte ranges of a resource. Essential for:
- Video seeking/scrubbing
- Resume interrupted downloads
- Parallel chunk downloads

**Range Request Format**:
```
Range: bytes=0-1023        // First 1024 bytes
Range: bytes=1024-2047     // Next 1024 bytes
Range: bytes=-500          // Last 500 bytes
Range: bytes=1000-         // From byte 1000 to end
```

**Response**:
```
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/5000
Content-Length: 1024
Content-Type: video/mp4
```

**Exercise:**
```javascript
const fs = require('fs');
const http = require('http');

// 1. Implement range request handler
http.createServer((req, res) => {
  const filePath = './video.mp4';
  const stat = fs.statSync(filePath);
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

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  } else {
    // Send full file
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes'
    });

    fs.createReadStream(filePath).pipe(res);
  }
}).listen(3000);

// 2. Parse complex range headers
function parseRange(rangeHeader, fileSize) {
  // Handle: bytes=0-499, bytes=-500, bytes=500-
  // Return: { start, end } or null if invalid

  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) {
    return null;
  }

  const parts = rangeHeader.replace(/bytes=/, '').split('-');
  let start = parseInt(parts[0], 10);
  let end = parseInt(parts[1], 10);

  if (isNaN(start) && !isNaN(end)) {
    // bytes=-500 (last 500 bytes)
    start = fileSize - end;
    end = fileSize - 1;
  } else if (!isNaN(start) && isNaN(end)) {
    // bytes=500- (from 500 to end)
    end = fileSize - 1;
  }

  // Validate
  if (isNaN(start) || isNaN(end) || start > end || start < 0) {
    return null;
  }

  return { start, end };
}

// 3. Handle multiple ranges (multipart/byteranges)
function handleMultipleRanges(ranges, filePath, res) {
  // Example: Range: bytes=0-50, 100-150
  // Response: multipart/byteranges with boundary

  const boundary = 'MULTIPART_BOUNDARY';
  const fileSize = fs.statSync(filePath).size;

  res.writeHead(206, {
    'Content-Type': `multipart/byteranges; boundary=${boundary}`
  });

  ranges.forEach(({ start, end }) => {
    res.write(`\r\n--${boundary}\r\n`);
    res.write(`Content-Type: video/mp4\r\n`);
    res.write(`Content-Range: bytes ${start}-${end}/${fileSize}\r\n\r\n`);

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res, { end: false });
  });

  res.write(`\r\n--${boundary}--\r\n`);
  res.end();
}

// 4. Implement conditional requests
function handleConditionalRequest(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const etag = `"${stat.size}-${stat.mtime.getTime()}"`;
  const lastModified = stat.mtime.toUTCString();

  // Check If-None-Match (ETag)
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304);
    return res.end();
  }

  // Check If-Modified-Since
  if (req.headers['if-modified-since'] === lastModified) {
    res.writeHead(304);
    return res.end();
  }

  // Send file with cache headers
  res.writeHead(200, {
    'ETag': etag,
    'Last-Modified': lastModified,
    'Cache-Control': 'public, max-age=3600'
  });

  fs.createReadStream(filePath).pipe(res);
}
```

---

### 5. Range Headers & 206 Partial Content

**Explanation:**
Already covered in detail above. Key points:

**Client sends**:
- `Range: bytes=start-end`
- `If-Range: <etag>` (optional, for conditional range)

**Server responds**:
- **206 Partial Content**: Range request successful
- **416 Range Not Satisfiable**: Invalid range
- **200 OK**: Ignoring range, sending full content

**Headers**:
- `Accept-Ranges: bytes` - Server supports ranges
- `Content-Range: bytes start-end/total` - Describes the range
- `Content-Length: size` - Size of this chunk

**Exercise:**
```javascript
// See exercises in section 4 above

// Additional: Test range requests
function testRangeRequests() {
  const http = require('http');

  // Test 1: First 1KB
  http.get({
    hostname: 'localhost',
    port: 3000,
    path: '/video.mp4',
    headers: { 'Range': 'bytes=0-1023' }
  }, (res) => {
    console.log('Status:', res.statusCode); // Should be 206
    console.log('Content-Range:', res.headers['content-range']);
  });

  // Test 2: Last 1KB
  http.get({
    hostname: 'localhost',
    port: 3000,
    path: '/video.mp4',
    headers: { 'Range': 'bytes=-1024' }
  }, (res) => {
    console.log('Status:', res.statusCode);
  });

  // Test 3: Invalid range
  http.get({
    hostname: 'localhost',
    port: 3000,
    path: '/video.mp4',
    headers: { 'Range': 'bytes=9999999-' }
  }, (res) => {
    console.log('Status:', res.statusCode); // Should be 416
  });
}
```

---

### 6. Content-Length vs Chunked Transfer

**Explanation:**
Two ways to send HTTP response body:

**Content-Length** (known size):
```
Content-Length: 1024

[exactly 1024 bytes of data]
```
- Server knows size in advance
- Client knows when download is complete
- Required for range requests
- Better for caching

**Chunked Transfer Encoding** (unknown size):
```
Transfer-Encoding: chunked

5\r\n
Hello\r\n
6\r\n
 World\r\n
0\r\n
\r\n
```
- Server doesn't know size in advance
- Data sent as it becomes available
- Used for dynamic content, streaming
- Cannot use with HTTP/1.0

**When to use**:
- **Content-Length**: Static files, known-size responses
- **Chunked**: Dynamic content, real-time data, SSE

**Exercise:**
```javascript
const http = require('http');

// 1. Send with Content-Length
http.createServer((req, res) => {
  const data = 'Hello World';

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(data)
  });

  res.end(data);
}).listen(3000);

// 2. Send with chunked encoding
http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });

  // Send data in chunks
  res.write('Hello ');
  setTimeout(() => res.write('World'), 1000);
  setTimeout(() => res.end(), 2000);
}).listen(3001);

// 3. Implement Server-Sent Events (SSE) with chunked encoding
http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send event every second
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
}).listen(3002);

// 4. Choose appropriate method
function sendResponse(res, data, isStatic) {
  if (isStatic) {
    // Known size: use Content-Length
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(data)
    });
    res.end(data);
  } else {
    // Unknown size: use chunked
    res.writeHead(200, {
      'Transfer-Encoding': 'chunked'
    });
    // Send data as it becomes available
    res.write(data);
    res.end();
  }
}

// 5. Implement progress tracking for chunked responses
class ChunkedProgressResponse {
  constructor(res) {
    this.res = res;
    this.sent = 0;
  }

  write(chunk) {
    this.sent += chunk.length;
    console.log(`Sent: ${this.sent} bytes`);
    return this.res.write(chunk);
  }

  end(chunk) {
    if (chunk) this.sent += chunk.length;
    console.log(`Total sent: ${this.sent} bytes`);
    return this.res.end(chunk);
  }
}
```

---

### 7. Caching Headers

**Explanation:**
HTTP caching headers control how responses are cached by browsers and CDNs.

**Key Headers**:

**Cache-Control** (modern, preferred):
- `no-store`: Don't cache at all
- `no-cache`: Cache but revalidate before use
- `public`: Can be cached by any cache
- `private`: Only browser cache, not CDN
- `max-age=3600`: Cache for 3600 seconds
- `must-revalidate`: Revalidate when stale

**Expires** (legacy):
- `Expires: Wed, 21 Oct 2025 07:28:00 GMT`

**Validation**:
- `ETag`: Unique identifier for resource version
- `Last-Modified`: When resource was last changed
- `If-None-Match`: Client sends ETag for validation
- `If-Modified-Since`: Client sends date for validation

**Exercise:**
```javascript
const fs = require('fs');
const crypto = require('crypto');

// 1. Implement caching for static files
function serveWithCache(filePath, res) {
  const stat = fs.statSync(filePath);

  // Generate ETag
  const etag = crypto
    .createHash('md5')
    .update(`${stat.size}-${stat.mtime.getTime()}`)
    .digest('hex');

  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  res.setHeader('ETag', etag);
  res.setHeader('Last-Modified', stat.mtime.toUTCString());

  fs.createReadStream(filePath).pipe(res);
}

// 2. Handle conditional requests
function handleConditional(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const etag = generateETag(stat);
  const lastModified = stat.mtime.toUTCString();

  // Check If-None-Match
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304);
    return res.end();
  }

  // Check If-Modified-Since
  const ifModifiedSince = req.headers['if-modified-since'];
  if (ifModifiedSince && new Date(ifModifiedSince) >= stat.mtime) {
    res.writeHead(304);
    return res.end();
  }

  // Send file
  serveWithCache(filePath, res);
}

// 3. Implement cache strategies for different content types
function getCacheHeaders(contentType) {
  const strategies = {
    // Static assets: cache aggressively
    'image/': 'public, max-age=31536000, immutable',
    'video/': 'public, max-age=31536000, immutable',
    'application/javascript': 'public, max-age=31536000, immutable',
    'text/css': 'public, max-age=31536000, immutable',

    // HTML: cache but revalidate
    'text/html': 'public, max-age=0, must-revalidate',

    // API responses: don't cache
    'application/json': 'no-store',

    // Default: cache for 1 hour
    'default': 'public, max-age=3600'
  };

  for (const [type, cacheControl] of Object.entries(strategies)) {
    if (contentType.startsWith(type)) {
      return cacheControl;
    }
  }

  return strategies.default;
}

// 4. Implement cache busting
function addCacheBuster(url) {
  // Add version query parameter
  const version = Date.now();
  return `${url}?v=${version}`;
}

// Usage: <script src="/app.js?v=1234567890"></script>

// 5. Implement Vary header for content negotiation
function handleContentNegotiation(req, res) {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  res.setHeader('Vary', 'Accept-Encoding');

  if (acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    // Send gzipped version
  } else {
    // Send uncompressed version
  }
}
```

---

### 8. MIME Types (Especially Video)

**Explanation:**
**MIME types** (Media Types) tell the browser how to handle the response content.

**Format**: `type/subtype`

**Common video MIME types**:
- `video/mp4` - MP4 files (.mp4)
- `video/webm` - WebM files (.webm)
- `video/ogg` - Ogg files (.ogv)
- `video/quicktime` - QuickTime files (.mov)
- `video/x-msvideo` - AVI files (.avi)
- `video/x-matroska` - MKV files (.mkv)

**Important parameters**:
- `video/mp4; codecs="avc1.42E01E, mp4a.40.2"` - Specifies codecs

**Other common types**:
- `application/json` - JSON data
- `text/html` - HTML documents
- `text/css` - CSS stylesheets
- `application/javascript` - JavaScript
- `image/jpeg`, `image/png`, `image/webp` - Images

**Exercise:**
```javascript
const path = require('path');

// 1. MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.txt': 'text/plain'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

// 2. Serve files with correct MIME type
const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  const filePath = `.${req.url}`;

  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not Found');
    }

    const mimeType = getMimeType(filePath);

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': stat.size
    });

    fs.createReadStream(filePath).pipe(res);
  });
}).listen(3000);

// 3. Handle video with codec information
function serveVideo(filePath, res) {
  const ext = path.extname(filePath);
  let contentType;

  switch (ext) {
    case '.mp4':
      // H.264 video, AAC audio
      contentType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      break;
    case '.webm':
      // VP8 video, Vorbis audio
      contentType = 'video/webm; codecs="vp8, vorbis"';
      break;
    default:
      contentType = getMimeType(filePath);
  }

  res.setHeader('Content-Type', contentType);
  fs.createReadStream(filePath).pipe(res);
}

// 4. Content-Type negotiation
function negotiateContentType(req, res, data) {
  const accept = req.headers.accept || '';

  if (accept.includes('application/json')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } else if (accept.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html');
    res.end(`<html><body>${JSON.stringify(data)}</body></html>`);
  } else if (accept.includes('text/xml')) {
    res.setHeader('Content-Type', 'text/xml');
    res.end(`<data>${JSON.stringify(data)}</data>`);
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.end(JSON.stringify(data));
  }
}

// 5. Force download with Content-Disposition
function forceDownload(filePath, res) {
  const filename = path.basename(filePath);
  const mimeType = getMimeType(filePath);

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  fs.createReadStream(filePath).pipe(res);
}

// 6. Inline vs attachment
function serveFile(filePath, res, inline = true) {
  const filename = path.basename(filePath);
  const disposition = inline ? 'inline' : 'attachment';

  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
  res.setHeader('Content-Type', getMimeType(filePath));

  fs.createReadStream(filePath).pipe(res);
}
```

---

### 9. Security Headers

**Explanation:**
Security headers protect against common web vulnerabilities.

**Essential Security Headers**:

1. **Content-Security-Policy (CSP)**: Prevents XSS attacks
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
   ```

2. **X-Content-Type-Options**: Prevents MIME sniffing
   ```
   X-Content-Type-Options: nosniff
   ```

3. **X-Frame-Options**: Prevents clickjacking
   ```
   X-Frame-Options: DENY
   ```

4. **Strict-Transport-Security (HSTS)**: Forces HTTPS
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

5. **X-XSS-Protection**: Enables XSS filter (legacy)
   ```
   X-XSS-Protection: 1; mode=block
   ```

6. **Referrer-Policy**: Controls referrer information
   ```
   Referrer-Policy: no-referrer-when-downgrade
   ```

7. **Permissions-Policy**: Controls browser features
   ```
   Permissions-Policy: geolocation=(), microphone=()
   ```

**Exercise:**
```javascript
const http = require('http');

// 1. Apply security headers middleware
function securityHeaders(req, res, next) {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "media-src 'self'"
  );

  // HSTS (only on HTTPS)
  if (req.connection.encrypted) {
    res.setHeader('Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  next();
}

// 2. CSP for video streaming
function videoCSP(res) {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "media-src 'self' blob: data:; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'"
  );
}

// 3. Implement CSP violation reporting
function setupCSPReporting(res) {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "report-uri /csp-violation-report"
  );
}

http.createServer((req, res) => {
  if (req.url === '/csp-violation-report' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('CSP Violation:', JSON.parse(body));
      res.end();
    });
  }
}).listen(3000);

// 4. Helmet.js equivalent (manual implementation)
function helmet(options = {}) {
  return function(req, res, next) {
    // Content Security Policy
    if (options.contentSecurityPolicy !== false) {
      res.setHeader('Content-Security-Policy',
        options.contentSecurityPolicy || "default-src 'self'"
      );
    }

    // DNS Prefetch Control
    res.setHeader('X-DNS-Prefetch-Control', 'off');

    // Frame Options
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Hide Powered-By
    res.removeHeader('X-Powered-By');

    // HSTS
    if (req.connection.encrypted) {
      res.setHeader('Strict-Transport-Security',
        'max-age=15552000; includeSubDomains'
      );
    }

    // IE No Open
    res.setHeader('X-Download-Options', 'noopen');

    // No Sniff
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    next();
  };
}

// 5. CORS headers (security consideration)
function corsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://example.com', 'https://app.example.com'];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }
}

// 6. Implement security headers for different routes
function routeSpecificSecurity(req, res) {
  if (req.url.startsWith('/api/')) {
    // API: strict CSP, no framing
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('X-Frame-Options', 'DENY');
  } else if (req.url.startsWith('/embed/')) {
    // Embeddable content: allow framing from specific origins
    res.setHeader('X-Frame-Options', 'ALLOW-FROM https://trusted-site.com');
  } else {
    // Default: standard security headers
    securityHeaders(req, res, () => {});
  }
}
```
