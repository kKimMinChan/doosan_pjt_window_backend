import { WebSocketServer, WebSocket } from 'ws';

interface PredictItem {
  from: { x: number; y: number };
  to: { x: number; y: number };
  distance?: number;
  radius?: number; // Optional radius for predict item
  rate?: number; // Optional rate for predict item
}

interface Block {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  rate?: number; // Optional rate for block
  radius?: number; // Optional radius for block
  distance?: number;
}

interface ParsedTP {
  event: 'connect-tp-demo' | 'disconnect-tp-demo';
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
      console.log(
        'Received message:',
        parsed,
        'predict',
        parsed.payload.predict,
      );

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

      if (parsed.event === 'connect-tp-demo') {
        const { fps, block, predict } = parsed.payload;

        const intervalMs = 1000 / fps;

        const emitIntervalTp = setInterval(() => {
          let x1, y1, x2, y2, blockDistance;

          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * block.radius;

          const tpUnrecognized = Math.random() * 100 < block.rate;

          ({
            x1,
            y1,
            x2,
            y2,
            distance: blockDistance,
          } = randomPositionBlock(block, angle, distance, tpUnrecognized));

          const predictItems: PredictItem[] = predict.map((item, index) =>
            randomPositionPredict(item, angle, distance, tpUnrecognized),
          );

          // console.log(
          //   x1,
          //   y1,
          //   x2,
          //   y2,
          //   predictItems[0].from,
          //   predictItems[1]?.from,
          // );

          const payload: TpPayload = {
            event: 'position',
            result: true,
            data: [
              {
                origin: { width: 1280, height: 720 },
                block: { x1, y1, x2, y2, distance: blockDistance },
                predict: predictItems,
              },
            ],
          };

          console.log(
            'Sending payload:',
            payload.data[0].predict,
            payload.data[0].block,
          );

          ws.send(JSON.stringify(payload));
        }, intervalMs);

        clientIntervalsTp.set(ws, {
          emitIntervalTp,
          windowMoveIntervalTp: null,
        });
      }

      if (parsed.event === 'disconnect-tp-demo') {
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
  tpUnrecognized: boolean,
): { x1: number; y1: number; x2: number; y2: number; distance?: number } {
  if (tpUnrecognized) {
    return { x1: 0, y1: 0, x2: 0, y2: 0, distance: 0 };
  }

  const x1 = Math.round(block.x1 + distance * Math.cos(angle));
  const y1 = Math.round(block.y1 + distance * Math.sin(angle));
  const x2 = Math.round(block.x2 + distance * Math.cos(angle));
  const y2 = Math.round(block.y2 + distance * Math.sin(angle));

  return { x1, y1, x2, y2, distance: block.distance };
}

function randomPositionPredict(
  predict: PredictItem,
  // radius: number,
  angle: number,
  distance: number,
  tpUnrecognized?: boolean,
): {
  from: { x: number; y: number };
  to: { x: number; y: number };
  distance: number;
} {
  if (tpUnrecognized) {
    return {
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
      distance: 0,
    };
  }
  if (Math.random() * 100 < predict.rate!) {
    return {
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
      distance: 0,
    };
  }

  const angleTo = Math.random() * 2 * Math.PI;
  const distanceTo = Math.random() * predict.radius!;

  const fromX = Math.round(predict.from.x + distance * Math.cos(angle));
  const fromY = Math.round(predict.from.y + distance * Math.sin(angle));
  const toX = Math.round(predict.to.x + distanceTo * Math.cos(angleTo));
  const toY = Math.round(predict.to.y + distanceTo * Math.sin(angleTo));

  const base = predict?.distance ?? 0; // 기준 거리 (정수)

  let distanceBetween = 0;

  if (base > 0) {
    const jitterRatio = 1 + (Math.random() * 0.06 - 0.03);
    distanceBetween = Math.round(base * jitterRatio * 100) / 100;
  } else {
    distanceBetween = 0;
  }

  console.log(
    'fromX:',
    fromX,
    'fromY',
    fromY,
    'toX',
    toX,
    'toY',
    toY,
    predict.from.x,
    predict.from.y,
    predict.to.x,
    predict.to.y,
  );

  return {
    from: { x: fromX, y: fromY },
    to: { x: toX, y: toY },
    distance: distanceBetween,
  };
}
