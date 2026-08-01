const express = require('express')
const cors = require('cors')
const zlib = require('zlib')
require('dotenv').config()
const app = express()
const port = 5001
const mongoDB = require("./db");

// Minimal gzip compression for JSON/text responses (no extra dependency).
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads')) return next();
  if (!req.headers['accept-encoding'] || req.headers['accept-encoding'].indexOf('gzip') === -1) {
    return next();
  }
  const originalEnd = res.end.bind(res);
  const originalWrite = res.write.bind(res);
  const chunks = [];
  res.write = (chunk) => {
    chunks.push(Buffer.from(chunk));
    return true;
  };
  res.end = (chunk, encoding, cb) => {
    if (chunk) chunks.push(Buffer.from(chunk));
    const body = Buffer.concat(chunks);
    zlib.gzip(body, (err, compressed) => {
      if (err || body.length < 1024) {
        res.removeHeader('Content-Encoding');
        originalWrite(body);
        return originalEnd(undefined, encoding, cb);
      }
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('Content-Length', compressed.length);
      originalWrite(compressed);
      originalEnd(undefined, encoding, cb);
    });
  };
  next();
});

const startServer = async () => {
  try {
    await mongoDB();

    app.use(cors({
      origin: ["http://localhost:3000", "http://localhost:3001"]
    }));

    app.use(express.json())
    app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));
    app.use('/api', require("./routes/CreateUser"));
    app.use('/api', require("./routes/DisplayData"));
    app.use('/api', require("./routes/OrderData"));
    app.use('/api', require("./routes/Profile"));
    app.use('/api', require("./routes/admin"));
    app.use('/api', require("./routes/upload"));
    app.use('/api', require("./routes/review"));
    app.use('/api', require("./routes/khalti"));
    app.use('/api', require("./routes/esewa"));

    app.get('/', (req, res) => {
      res.send('Hello World!')
    })

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()