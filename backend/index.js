const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = 5001
const mongoDB = require("./db");

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