import { WebSocketServer, WebSocket } from 'ws';

interface ParsedTP {
  event:
    | 'update-tp-selection'
    | 'disconnect-tp-selection'
    | 'connect-tp-selection';
  payload: {
    target?: 'tp' | 'block';
  };
}

interface TpSelectionPayload {
  event:
    | 'update-tp-selection'
    | 'connect-tp-selection'
    | 'disconnect-tp-selection';
  result: boolean;
  payload?: {
    target?: 'tp' | 'block';
    clientId?: string; // 클라이언트 ID 추가
  };
}

export const wssTpSelectionSync = new WebSocketServer({ noServer: true });

const clients = new Map<string, WebSocket>(); // id -> ws

wssTpSelectionSync.on('connection', (ws) => {
  const id = crypto.randomUUID(); // 매 접속 고유 ID
  (ws as any).id = id;
  clients.set(id, ws);
  console.log(`Client connected: ${id}`);

  safeSend(ws, {
    event: 'connect-tp-selection',
    result: true,
    payload: {
      clientId: id, // 클라이언트 ID 포함
    },
  });

  ws.on('message', (message) => {
    try {
      const parsed: ParsedTP = JSON.parse(message.toString());

      if (parsed.event === 'update-tp-selection') {
        if (parsed.payload.target) {
          const payload: TpSelectionPayload = {
            event: 'update-tp-selection',
            result: true,
            payload: {
              target: parsed.payload.target,
            },
          };
          ws.send(
            JSON.stringify({
              event: 'update-tp-selection',
              result: true,
            }),
          );
          broadcastExcept(ws, payload);
        } else {
          ws.send(
            JSON.stringify({ event: 'update-tp-selection', result: false }),
          );
        }
      }
      // else if (parsed.event === 'connect-tp-selection') {
      //   ws.send(
      //     JSON.stringify({
      //       event: 'connect-tp-selection',
      //       result: true,
      //       payload: {
      //         clientId: id, // 클라이언트 ID 포함
      //       },
      //     }),
      //   );
      // }
      else if (parsed.event === 'disconnect-tp-selection') {
        ws.send(
          JSON.stringify({
            event: 'disconnect-tp-selection',
            result: true,
            payload: {
              clientId: id, // 클라이언트 ID 포함
            },
          }),
        );
      }
    } catch (err) {
      console.error('Invalid message:', message);
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${id}`);
    clients.delete(id);
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
