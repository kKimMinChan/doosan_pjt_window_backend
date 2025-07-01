import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

// export function initializeWebSocketTp(server: Server) {

// }

interface PredictItem {
  from: { x: number; y: number };
  to: { x: number; y: number };
  distance?: number;
}

interface Block {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ParsedTP {
  event: 'start-stream' | 'stop-stream';
  payload: {
    fps: number;
    radius: number;
    block: Block;
    predict: PredictItem[];
  };
}

interface TpDetectionData {
  // 기준 해상도
  origin: {
    width: number;
    height: number;
  };

  // TP 적재물 좌표
  block: Block;

  // 충돌 예상 지점의 두 좌표와 거리
  predict: PredictItem[];
}

interface TpPayload {
  event: 'position';
  result: boolean;
  data: TpDetectionData;
}

export const wssTp = new WebSocketServer({ noServer: true });

const clientIntervalsTp = new Map<
  WebSocket,
  {
    emitIntervalTp: NodeJS.Timeout;
    windowMoveIntervalTp: NodeJS.Timeout;
  }
>();

wssTp.on('connection', (ws) => {
  console.log('✅ TP 서버 – connection 이벤트 발생');
  (ws as any).connectedAt = Date.now();

  ws.on('message', (message) => {
    try {
      const parsed: ParsedTP = JSON.parse(message.toString());
      console.log('Received message:', parsed);

      if (parsed.event === 'start-stream') {
        const { fps, radius, block, predict } = parsed.payload;

        const intervalMs = 1000 / fps;
        // let isInPredictMode = false;
        // let predictModeTimeout: NodeJS.Timeout | null = null;

        // let step = 0;
        // let direction = 0.9;
        // let d: number;

        // const totalSteps = 8;
        // const stepsPerCycle = totalSteps * 2 - 2;
        // const stepIntervalFrames = Math.max(
        //   1,
        //   Math.floor(predictDuration / intervalMs / stepsPerCycle),
        // );
        // let predictFrameCount = 0;

        const emitIntervalTp = setInterval(() => {
          // const now = Date.now();
          // const elapsedSinceConnect = now - (ws as any).connectedAt;
          // const isOutlier = Math.random() < outlierRate * 0.01;
          let x1, y1, x2, y2;

          ({ x1, y1, x2, y2 } = randomPositionBlock(block, radius));

          const predictItems: PredictItem[] = predict.map((item) =>
            randomPositionPredict(item, radius),
          );

          // const predictDistance = Math.random() * radius;

          const payload: TpPayload = {
            event: 'position',
            result: true,
            data: {
              origin: { width: 1280, height: 720 },
              block: { x1, y1, x2, y2 },
              predict: predictItems,
            },
          };

          // if (blockX > 0 && blockY > 0) {
          //   payload.data.block = [{ x, y }];
          // }

          // if (isInPredictMode && elapsedSinceConnect >= 3000) {
          //   payload.data.predict = [{ x: x2, y: y2, d: d.toFixed(1) }];
          // }

          console.log(payload);

          ws.send(JSON.stringify(payload));
        }, intervalMs);

        clientIntervalsTp.set(ws, {
          emitIntervalTp,
          windowMoveIntervalTp: null,
        });
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
  const timers = clientIntervalsTp.get(ws);
  if (timers) {
    clearInterval(timers.emitIntervalTp);
    clearInterval(timers.windowMoveIntervalTp);
    clientIntervalsTp.delete(ws);
  }
}

function randomPositionBlock(
  block: { x1: number; y1: number; x2: number; y2: number },
  radius: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;

  const x1 = Math.round(block.x1 + distance * Math.cos(angle));
  const y1 = Math.round(block.y1 + distance * Math.sin(angle));
  const x2 = Math.round(block.x2 + distance * Math.cos(angle));
  const y2 = Math.round(block.y2 + distance * Math.sin(angle));

  return { x1, y1, x2, y2 };
}
function randomPositionPredict(
  predict: PredictItem,
  radius: number,
): {
  from: { x: number; y: number };
  to: { x: number; y: number };
  distance: number;
} {
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;

  const fromX = Math.round(predict.from.x + distance * Math.cos(angle));
  const fromY = Math.round(predict.from.y + distance * Math.sin(angle));
  const toX = Math.round(predict.to.x + distance * Math.cos(angle));
  const toY = Math.round(predict.to.y + distance * Math.sin(angle));
  const distanceBetween =
    Math.round(
      Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)) * 100,
    ) / 100;

  return {
    from: { x: fromX, y: fromY },
    to: { x: toX, y: toY },
    distance: distanceBetween,
  };
}
