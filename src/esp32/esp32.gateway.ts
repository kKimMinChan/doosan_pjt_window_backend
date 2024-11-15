// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { spawn } from 'child_process';

// @WebSocketGateway(4200, {
//   namespace: 'esp32',
//   cors: 'http://localhost:3000',
// })
// export class Esp32Gateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private ffmpegProcess: any;
//   private isRecording = false;

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//     if (this.isRecording) {
//       this.stopRecording();
//     }
//   }

//   @SubscribeMessage('start')
//   handleStartStream(client: Socket, data: { url: string }) {
//     if (!this.isRecording) {
//       console.log('start');
//       this.startRecording(data.url);
//       this.isRecording = true;
//     }
//   }

//   @SubscribeMessage('stop')
//   handleStopStream(client: Socket) {
//     if (this.isRecording) {
//       this.stopRecording();
//       this.isRecording = false;
//     }
//   }

//   private startRecording(url: string) {
//     // ESP32 스트림을 받아와 저장하는 ffmpeg 프로세스 시작
//     this.ffmpegProcess = spawn('ffmpeg', [
//       '-i',
//       url,
//       '-c:v',
//       'copy',
//       '-c:a',
//       'aac',
//       '-f',
//       'mp4',
//       `recorded_${Date.now()}.mp4`,
//     ]);

//     // ffmpeg의 출력 데이터를 클라이언트에게 전송
//     this.ffmpegProcess.stdout.on('data', (data) => {
//       console.log(data, 'video');
//       this.server.emit('video', data);
//     });

//     this.ffmpegProcess.stderr.on('data', (data) => {
//       console.log(`ffmpeg stderr: ${data}`);
//     });

//     this.ffmpegProcess.on('close', (code) => {
//       console.log(`ffmpeg process closed with code ${code}`);
//     });
//   }

//   private stopRecording() {
//     if (this.ffmpegProcess) {
//       this.ffmpegProcess.kill('SIGINT');
//       console.log('Recording stopped and saved.');
//     }
//   }
// }
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { spawn } from 'child_process';

@WebSocketGateway(4200, {
  namespace: 'esp32',
  cors: 'http://localhost:3000',
})
export class Esp32Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private ffmpegProcess: any;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    if (this.ffmpegProcess) {
      this.stopStream();
    }
  }

  @SubscribeMessage('start')
  handleStartStream(client: Socket, data: { url: string }) {
    if (!this.ffmpegProcess) {
      console.log('Starting video stream from ESP32');
      this.startStream(data.url);
    }
  }

  @SubscribeMessage('stop')
  handleStopStream(client: Socket) {
    if (this.ffmpegProcess) {
      this.stopStream();
    }
  }

  private startStream(url: string) {
    this.ffmpegProcess = spawn('ffmpeg', [
      '-i',
      url,
      '-f',
      'mpegts',
      '-codec:v',
      'mpeg1video',
      '-r',
      '30',
      'pipe:1',
    ]);

    this.ffmpegProcess.stdout.on('data', (data) => {
      console.log('stdout', data);
      this.server.emit('videoStream', data);
    });

    this.ffmpegProcess.stderr.on('data', (data) => {
      console.error(`FFmpeg error: ${data}`);
    });

    this.ffmpegProcess.on('close', (code) => {
      console.log(`FFmpeg process closed with code ${code}`);
    });
  }

  private stopStream() {
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill('SIGINT');
      console.log('FFmpeg stream stopped');
    }
  }
}
