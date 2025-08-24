const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors')
const { connectDB } = require('./src/config/db');
const backtestRoutes = require('./routes/backTestRoutes');


const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.port || 3001;

const server = createServer(app);
const wss = new WebSocket.Server({noServer: true});

wss.on('connection', ws => {
  console.log('Client connected.');
  ws.on('close', () => {
    console.log('Client disconnected .');
  });
});


app.use((req,res,next)=>{
    req.wss = wss;
    next();
})

connectDB();
app.use('/api', backtestRoutes);
app.use(express.static(path.join(__dirname, '..', 'react-ui', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'react-ui', 'build', 'index.html'));
});


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request);
  });
});
