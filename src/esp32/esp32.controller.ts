// // import { Controller, Get, Sse } from '@nestjs/common';
// // import { Observable, Subject } from 'rxjs';
// // import * as http from 'http';

// // @Controller('esp32')
// // export class Esp32Controller {
// //   private videoStream$ = new Subject<string>();

// //   constructor() {
// //     this.initializeESP32Stream();
// //   }

// //   private initializeESP32Stream() {
// //     http
// //       .get('http://192.168.0.8:81/stream', (response) => {
// //         response.on('data', (chunk: Buffer) => {
// //           this.videoStream$.next(chunk.toString('base64'));
// //         });

// //         response.on('end', () => {
// //           console.log('ESP32 stream ended');
// //         });
// //       })
// //       .on('error', (error) => {
// //         console.error('Error initializing ESP32 stream:', error);
// //       });
// //   }

// //   @Get('stream/video')
// //   @Sse()
// //   videoStream(): Observable<MessageEvent> {
// //     return new Observable((observer) => {
// //       this.videoStream$.subscribe((frame) => {
// //         const event = new MessageEvent('message', {
// //           data: frame,
// //         });
// //         observer.next(event);
// //       });
// //     });
// //   }
// // }
// import { Controller, Get, Sse } from '@nestjs/common';
// import { Observable, Subject } from 'rxjs';
// import * as http from 'http';

// @Controller('esp32')
// export class Esp32Controller {
//   private videoStream$ = new Subject<string>();

//   constructor() {
//     this.initializeESP32Stream();
//   }

//   private initializeESP32Stream() {
//     let buffer = Buffer.alloc(0);
//     http
//       .get('http://192.168.0.8:81/stream', (response) => {
//         response.on('data', (chunk: Buffer) => {
//           buffer = Buffer.concat([buffer, chunk]);

//           // Check for boundary marker to split images
//           const boundary = '--123456789000000000000987654321';
//           let boundaryIndex = buffer.indexOf(boundary);

//           while (boundaryIndex !== -1) {
//             // Extract the image data up to the boundary
//             const imageChunk = buffer.slice(0, boundaryIndex);
//             buffer = buffer.slice(boundaryIndex + boundary.length);

//             // Extract the Content-Length header and image data
//             const contentLengthMatch = imageChunk
//               .toString()
//               .match(/Content-Length: (\d+)/);
//             if (contentLengthMatch) {
//               const contentLength = parseInt(contentLengthMatch[1], 10);
//               const imageDataIndex = imageChunk.indexOf('\r\n\r\n') + 4;
//               const imageData = imageChunk.slice(
//                 imageDataIndex,
//                 imageDataIndex + contentLength,
//               );

//               // Send the image data as base64
//               this.videoStream$.next(imageData.toString('base64'));
//             }

//             boundaryIndex = buffer.indexOf(boundary);
//           }
//         });

//         response.on('end', () => {
//           console.log('ESP32 stream ended');
//         });
//       })
//       .on('error', (error) => {
//         console.error('Error initializing ESP32 stream:', error);
//       });
//   }

//   @Get('stream/video')
//   @Sse()
//   videoStream(): Observable<MessageEvent> {
//     console.log('connect');
//     return new Observable((observer) => {
//       this.videoStream$.subscribe((frame) => {
//         const event = new MessageEvent('message', {
//           data: frame,
//         });
//         observer.next(event);
//       });
//     });
//   }
// }

import { Controller, Get, Post, Sse, Body } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('esp32')
export class Esp32Controller {
  private videoStream$ = new Subject<string>();
  private recording = false;
  private recordBuffer = Buffer.alloc(0);
  private recordFileName = '';

  constructor() {
    // this.initializeESP32Stream();
  }

  private initializeESP32Stream() {
    let buffer = Buffer.alloc(0);
    http
      .get('http://192.168.0.8:81/stream', (response) => {
        this.startRecording();

        response.on('data', (chunk: Buffer) => {
          buffer = Buffer.concat([buffer, chunk]);

          // Check for boundary marker to split images
          const boundary = '--123456789000000000000987654321';
          let boundaryIndex = buffer.indexOf(boundary);

          while (boundaryIndex !== -1) {
            // Extract the image data up to the boundary
            const imageChunk = buffer.slice(0, boundaryIndex);
            buffer = buffer.slice(boundaryIndex + boundary.length);

            // Extract the Content-Length header and image data
            const contentLengthMatch = imageChunk
              .toString()
              .match(/Content-Length: (\d+)/);
            if (contentLengthMatch) {
              const contentLength = parseInt(contentLengthMatch[1], 10);
              const imageDataIndex = imageChunk.indexOf('\r\n\r\n') + 4;
              const imageData = imageChunk.slice(
                imageDataIndex,
                imageDataIndex + contentLength,
              );

              // Send the image data as base64
              const base64Data = imageData.toString('base64');
              this.videoStream$.next(base64Data);

              // Record the data
              if (this.recording) {
                this.recordBuffer = Buffer.concat([
                  this.recordBuffer,
                  imageData,
                ]);
              }
            }

            boundaryIndex = buffer.indexOf(boundary);
          }
        });

        response.on('end', () => {
          console.log('ESP32 stream ended');
          this.stopRecording();
        });
      })
      .on('error', (error) => {
        console.error('Error initializing ESP32 stream:', error);
      });
  }

  private startRecording() {
    this.recording = true;
    this.recordFileName = path.join(__dirname, `recording-${uuidv4()}.mjpeg`);
    this.recordBuffer = Buffer.alloc(0);
    console.log(`Recording started: ${this.recordFileName}`);
  }

  private stopRecording() {
    if (this.recording) {
      fs.writeFile(this.recordFileName, this.recordBuffer, (err) => {
        if (err) {
          console.error('Error saving recording:', err);
        } else {
          console.log(`Recording saved: ${this.recordFileName}`);
        }
      });
      this.recording = false;
    }
  }

  @Get('stream/video')
  @Sse()
  videoStream(): Observable<MessageEvent> {
    this.initializeESP32Stream();
    return new Observable((observer) => {
      this.videoStream$.subscribe((frame) => {
        const event = new MessageEvent('message', {
          data: frame,
        });
        observer.next(event);
      });
    });
  }

  @Post('stream/stop')
  stopStream() {
    console.log('Stop signal received from client');
    this.stopRecording();
  }
}

// ESP32에서 데이터를 HTTP 스트림으로 전달하는 코드를 통해
// NestJS 서버에서 받아온 후 Subject를 통해 구독하고,
// 구독한 데이터를 Sse 데코레이터를 사용해 클라이언트로 전달하며,
// 스트림이 시작될 때 녹화를 시작하고 React에서 요청한 경우 스트림을 중지하고 파일로 저장합니다.

// ESP32에서 데이터를 HTTP 스트림으로 전달하는 코드를 통해
// NestJS 서버에서 받아온 후 Subject를 통해 구독하고,
// 구독한 데이터를 Sse 데코레이터를 사용해 클라이언트로 전달하며,
// 스트림이 시작될 때 녹화를 시작하고 종료 시 파일로 저장합니다.

// ESP32에서 데이터를 HTTP 스트림으로 전달하는 코드를 통해
// NestJS 서버에서 받아온 후 Subject를 통해 구독하고,
// 구독한 데이터를 Sse 데코레이터를 사용해 클라이언트로 전달하며,
// 스트림이 시작될 때 녹화를 시작하고 종료 시 파일로 저장합니다.
