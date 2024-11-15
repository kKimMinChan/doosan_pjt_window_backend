import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { Server } from 'socket.io';

@Injectable()
export class Esp32Service {
  private ffmpegProcess: any;

  startStream(server: Server, url: string) {
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
      server.emit('webrtc-stream', data);
    });

    this.ffmpegProcess.stderr.on('data', (data) => {
      console.error(`FFmpeg error: ${data}`);
    });

    this.ffmpegProcess.on('close', (code) => {
      console.log(`FFmpeg process closed with code ${code}`);
    });
  }

  stopStream() {
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill();
    }
  }
}
