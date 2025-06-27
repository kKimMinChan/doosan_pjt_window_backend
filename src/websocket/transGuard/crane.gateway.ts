import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export function initializeWebSocketCrane(server: Server) {
  const wssCrane = new WebSocketServer({ server, path: '/demo-crane' });
  console.log('✅ Crane WebSocket initialized on /demo-crane');
  const clientIntervals = new Map<
    WebSocket,
    {
      emitInterval: NodeJS.Timeout;
      windowMoveInterval: NodeJS.Timeout;
    }
  >();

  wssCrane.on('connection', (ws) => {
    console.log('Client connected');
    (ws as any).connectedAt = Date.now();

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        console.log('Received message:', parsed);

        if (parsed.event === 'start-stream') {
          const {
            fps,
            outlierRate,
            outlierMultiplier,
            blockX,
            blockY,
            predictRate = 30,
            predictDuration = 3000,
            radius = 50,
            predictX,
            predictY,
          } = parsed.payload;

          const intervalMs = 1000 / fps;
          let isInPredictMode = false;
          let predictModeTimeout: NodeJS.Timeout | null = null;

          let step = 0;
          let direction = 0.9;
          let d: number;

          const totalSteps = 8;
          const stepsPerCycle = totalSteps * 2 - 2;
          const stepIntervalFrames = Math.max(
            1,
            Math.floor(predictDuration / intervalMs / stepsPerCycle),
          );
          let predictFrameCount = 0;

          const emitInterval = setInterval(() => {
            const now = Date.now();
            const elapsedSinceConnect = now - (ws as any).connectedAt;
            const isOutlier = Math.random() < outlierRate * 0.01;
            let x, y, x2, y2;

            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * radius;
            const predictDistance = Math.random() * radius;

            const adjustedDistance = isOutlier
              ? distance * outlierMultiplier
              : distance;
            const predictAdjustedDistance = isOutlier
              ? predictDistance * outlierMultiplier
              : predictDistance;

            x = Math.round(blockX + adjustedDistance * Math.cos(angle));
            y = Math.round(blockY + adjustedDistance * Math.sin(angle));
            x2 = Math.round(
              predictX + predictAdjustedDistance * Math.cos(angle),
            );
            y2 = Math.round(
              predictY + predictAdjustedDistance * Math.sin(angle),
            );

            if (!isInPredictMode && Math.random() < predictRate * 0.01) {
              isInPredictMode = true;
              step = 0;
              direction = 0.9;
              predictFrameCount = 0;

              predictModeTimeout = setTimeout(() => {
                isInPredictMode = false;
                d = 0;
              }, predictDuration);
            }

            if (isInPredictMode) {
              if (predictFrameCount % stepIntervalFrames === 0) {
                d = step;
                step += direction;

                if (step >= totalSteps - 1) {
                  direction = -1;
                } else if (step <= 0 && direction === -1) {
                  isInPredictMode = false;
                  d = 0;
                  clearTimeout(predictModeTimeout!);
                }
              }
              predictFrameCount++;
            }

            const payload: any = {
              event: 'position',
              result: true,
              data: {
                origin: { width: 1280, height: 720 },
              },
            };

            if (blockX != 0 && blockY != 0) {
              payload.data.block = [{ x, y }];
            }

            if (isInPredictMode && elapsedSinceConnect >= 3000) {
              payload.data.predict = [{ x: x2, y: y2, d: d.toFixed(1) }];
            }

            console.log(payload);

            ws.send(JSON.stringify(payload));
          }, intervalMs);

          clientIntervals.set(ws, { emitInterval, windowMoveInterval: null });
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
}
