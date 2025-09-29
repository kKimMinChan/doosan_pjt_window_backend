import { WebSocketServer, WebSocket } from 'ws';

const HEARTBEAT_MS = 25_000;

function setupHeartbeat() {
  const t = setInterval(() => {
    for (const ws of wssTpSelectionSync.clients) {
      const s = ws as WebSocket & { isAlive?: boolean };
      if (s.isAlive === false) {
        try {
          s.terminate();
        } catch {}
        continue;
      }
      s.isAlive = false;
      try {
        s.ping();
      } catch {}
    }
  }, HEARTBEAT_MS);
  process.on('SIGINT', () => clearInterval(t));
  process.on('SIGTERM', () => clearInterval(t));
}
setupHeartbeat();

interface ParsedTP {
  event: 'update-tp-selection' | 'connect-tp-selection';
  payload: {
    target?: 'tp' | 'block';
  };
}

interface TpSelectionPayload {
  event: 'last-tp-selection' | 'connect-tp-selection';
  result: boolean;
  payload?: {
    target?: 'tp' | 'block';
    clientId?: string; // 클라이언트 ID 추가
  };
}

export const wssTpSelectionSync = new WebSocketServer({ noServer: true });

const clients = new Map<string, WebSocket>(); // id -> ws

let currentSelection: TpSelectionPayload | null = null;

wssTpSelectionSync.on('connection', (ws, req?: any) => {
  const kst = () =>
    new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const ip =
    req?.socket?.remoteAddress ??
    req?.headers?.['x-forwarded-for'] ??
    'unknown';
  const id = crypto.randomUUID(); // 매 접속 고유 ID
  (ws as any).id = id;
  clients.set(id, ws);

  (ws as any).isAlive = true;
  ws.on('pong', () => {
    (ws as any).isAlive = true;
  });

  // (선택) TCP keepalive도 켜기
  ws._socket?.setKeepAlive?.(true, 30_000);

  console.log(`[WS][${kst()}] CONNECT id=${id} ip=${ip}`);

  ws.on('message', (message) => {
    try {
      const parsed: ParsedTP = JSON.parse(message.toString());

      if (parsed.event === 'update-tp-selection') {
        if (parsed.payload.target) {
          const payload: TpSelectionPayload = {
            event: 'last-tp-selection',
            result: true,
            payload: {
              target: parsed.payload.target,
            },
          };

          // ✅ 최신 상태로 기억
          currentSelection = payload;

          broadcastExcept(ws, payload);
        }
      } else if (parsed.event === 'connect-tp-selection') {
        // 신규 클라이언트가 연결되었을 때, 현재 상태를 알려줌
        if (currentSelection) {
          safeSend(ws, currentSelection);
        }
      }
    } catch (err) {
      console.error('Invalid message:', message);
    }
  });

  ws.on('close', () => {
    console.log(`[WS][${kst()}] DISCONNECT id=${id} ip=${ip}`);
    clients.delete(id);
    // ✅ 모든 클라이언트가 떠나면 상태 초기화
    if (clients.size === 0) {
      console.log(
        `[WS][${kst()}] All clients disconnected. Resetting currentSelection.`,
      );
      currentSelection = null;
    }
  });
});

// 보낸 사람 제외 브로드캐스트 예시
function broadcastExcept(sender: WebSocket, payload: any) {
  const msg = JSON.stringify(payload);
  for (const client of wssTpSelectionSync.clients) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      try {
        client.send(msg);
      } catch (e) {
        console.error('broadcast failed:', e);
      }
    }
  }
}

function safeSend(ws: WebSocket, data: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(data));
    } catch (e) {
      console.error('send failed:', e);
    }
  } else {
    // 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED
    console.warn(`skip send: state=${ws.readyState}`);
  }
}
