import { WebSocketServer, WebSocket } from 'ws';

interface PredictItem {
  from: { x: number; y: number };
  to: { x: number; y: number };
  distance?: number;
  radius?: number; // Optional radius for predict item
}

interface Block {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  radius?: number; // Optional radius for block
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
  data: TpDetectionData[];
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

      // ✅ payload가 빈 객체일 경우 연결 종료
      if (
        parsed &&
        typeof parsed.payload === 'object' &&
        parsed.payload &&
        Object.keys(parsed.payload).length === 0
      ) {
        console.warn('⚠️ 빈 payload 수신 → 연결 종료');
        ws.close(1000, 'Empty payload received');
        return;
      }

      if (parsed.event === 'start-stream') {
        const { fps, radius, block, predict } = parsed.payload;

        const intervalMs = 1000 / fps;

        const emitIntervalTp = setInterval(() => {
          let x1, y1, x2, y2;

          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * block.radius;

          ({ x1, y1, x2, y2 } = randomPositionBlock(block, angle, distance));

          const predictItems: PredictItem[] = predict.map((item, index) =>
            randomPositionPredict(item, radius, angle, distance),
          );

          console.log(
            x1,
            y1,
            x2,
            y2,
            predictItems[0].from,
            predictItems[1]?.from,
          );

          const payload: TpPayload = {
            event: 'position',
            result: true,
            data: [
              {
                origin: { width: 1280, height: 720 },
                block: { x1, y1, x2, y2 },
                predict: predictItems,
              },
            ],
          };

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
  block: Block,
  angle: number,
  distance: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const x1 = Math.round(block.x1 + distance * Math.cos(angle));
  const y1 = Math.round(block.y1 + distance * Math.sin(angle));
  const x2 = Math.round(block.x2 + distance * Math.cos(angle));
  const y2 = Math.round(block.y2 + distance * Math.sin(angle));

  return { x1, y1, x2, y2 };
}
function randomPositionPredict(
  predict: PredictItem,
  radius: number,
  angle: number,
  distance: number,
): {
  from: { x: number; y: number };
  to: { x: number; y: number };
  distance: number;
} {
  const angleTo = Math.random() * 2 * Math.PI;
  const distanceTo = Math.random() * radius;

  const fromX = Math.round(predict.from.x + distance * Math.cos(angle));
  const fromY = Math.round(predict.from.y + distance * Math.sin(angle));
  const toX = Math.round(predict.to.x + distanceTo * Math.cos(angleTo));
  const toY = Math.round(predict.to.y + distanceTo * Math.sin(angleTo));
  const distanceBetween =
    Math.round(
      (Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2)) * 100) /
        (predict?.distance ? predict.distance : 1),
    ) / 100;

  console.log(distanceBetween);

  return {
    from: { x: fromX, y: fromY },
    to: { x: toX, y: toY },
    distance: distanceBetween,
  };
}
