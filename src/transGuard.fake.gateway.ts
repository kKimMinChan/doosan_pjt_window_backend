import WebSocket, { WebSocketServer } from 'ws';
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/Users/kimminchan/localhost-key.pem'),
  cert: fs.readFileSync('/Users/kimminchan/localhost.pem'),
};

const server = https.createServer(options);
const wss = new WebSocketServer({ server });

const clientIntervals = new Map<
  WebSocket,
  {
    emitInterval: NodeJS.Timeout;
    windowMoveInterval: NodeJS.Timeout;
  }
>();

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());

      if (parsed.event === 'start-stream') {
        const { fps, outlierRate, outlierMultiplier, videoWidth, videoHeight } =
          parsed.payload;

        const intervalMs = 1000 / fps;
        const windowWidth = Math.floor(videoWidth * 0.1);
        const windowHeight = Math.floor(videoHeight * 0.1);

        let currentRange = randomMovingWindow(
          videoWidth,
          videoHeight,
          windowWidth,
          windowHeight,
        );

        const windowMoveInterval = setInterval(() => {
          currentRange = randomMovingWindow(
            videoWidth,
            videoHeight,
            windowWidth,
            windowHeight,
          );
          console.log('📸 카메라 이동:', currentRange);
        }, 3000);

        const emitInterval = setInterval(() => {
          const isOutlier = Math.random() < outlierRate * 0.01;
          const { xMin, xMax, yMin, yMax } = currentRange;

          let x = Math.random() * (xMax - xMin) + xMin;
          let y = Math.random() * (yMax - yMin) + yMin;

          if (isOutlier) {
            x *= outlierMultiplier;
            y *= outlierMultiplier;
          }

          ws.send(
            JSON.stringify({
              event: 'position',
              result: true,
              payload: { x, y, outlier: isOutlier },
            }),
          );
        }, intervalMs);

        clientIntervals.set(ws, { emitInterval, windowMoveInterval });
      }

      if (parsed.event === 'stop-stream') {
        clearClient(ws);
        ws.send(JSON.stringify({ event: 'stopped', result: true }));
      }
    } catch (err) {
      console.error('Invalid message:', message);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clearClient(ws);
  });
});

function clearClient(ws: WebSocket) {
  const timers = clientIntervals.get(ws);
  if (timers) {
    clearInterval(timers.emitInterval);
    clearInterval(timers.windowMoveInterval);
    clientIntervals.delete(ws);
  }
}

function randomMovingWindow(
  videoWidth: number,
  videoHeight: number,
  windowWidth: number,
  windowHeight: number,
) {
  const xMin = Math.floor(Math.random() * (videoWidth - windowWidth));
  const yMin = Math.floor(Math.random() * (videoHeight - windowHeight));
  return {
    xMin,
    xMax: xMin + windowWidth,
    yMin,
    yMax: yMin + windowHeight,
  };
}

server.listen(443, () => {
  console.log('✅ WebSocket server listening on wss://dev.fboedev.com');
});
