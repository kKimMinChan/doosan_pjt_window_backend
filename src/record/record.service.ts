import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { getBase64Thumbnail } from 'src/lib/getBase64Image';

@Injectable()
export class RecordService {
  private readonly rootFolder = path.join(process.cwd(), 'video_storage');
  private ffmpegProcess: ChildProcess | null = null;
  private ffmpegImageCapture: ChildProcess | null = null;
  private isRecording = false;

  constructor(private readonly httpService: HttpService) {}

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording is already in progress.');
    }

    // 오늘 날짜 정보를 가져옴
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const folderName = `${year}-${month}-${day}`;

    // 저장할 폴더 경로 설정
    const dayFolder = path.join(this.rootFolder, folderName);
    const recordFolderName = `${date
      .getHours()
      .toString()
      .padStart(2, '0')}_${date.getMinutes().toString().padStart(2, '0')}_${date
      .getSeconds()
      .toString()
      .padStart(2, '0')}`;
    const recordFolder = path.join(dayFolder, recordFolderName);

    // 폴더가 존재하지 않으면 생성
    if (!fs.existsSync(this.rootFolder)) {
      fs.mkdirSync(this.rootFolder);
    }
    if (!fs.existsSync(dayFolder)) {
      fs.mkdirSync(dayFolder);
    }
    if (!fs.existsSync(recordFolder)) {
      fs.mkdirSync(recordFolder, { recursive: true });
    }

    // 파일 이름 생성 (고유하게 설정)
    const videoFilePath = path.join(recordFolder, 'extra.mp4'); // 최종 저장할 비디오 파일 경로 설정
    const imageFilePath = path.join(recordFolder, 'thumbnail.jpg'); // 캡처 이미지 파일 경로 설정

    console.log(videoFilePath, 'videoFilePath');
    console.log(imageFilePath, 'imageFilePath');

    try {
      // 먼저 이미지를 캡처함
      await this.captureImage(imageFilePath);
      console.log('Image captured successfully');

      // 이미지 캡처 후 비디오 녹화 시작
      setTimeout(() => {
        this.startVideoRecording(videoFilePath);
      }, 1000);
    } catch (error) {
      console.error('Error during recording process:', error);
      throw error;
    }
  }

  private captureImage(imageFilePath: string): Promise<void> {
    if (this.ffmpegProcess) {
      console.error('FFmpeg process is already running.');
      return Promise.reject(new Error('FFmpeg process is already running.'));
    }
    return new Promise((resolve, reject) => {
      const response = this.httpService.get(
        'http://192.168.0.45:8080/stream.mjpg',
        {
          responseType: 'stream',
        },
      );

      firstValueFrom(response)
        .then((res) => {
          if (!res || res.status !== 200 || !res.data) {
            console.error('Stream is unavailable or invalid.');
            reject(new Error('Stream is unavailable or invalid.'));
            return;
          }

          this.ffmpegImageCapture = spawn('ffmpeg', [
            '-y', // 덮어쓰기 허용
            '-i',
            'pipe:0',
            '-frames:v',
            '1',
            imageFilePath,
          ]);

          res.data.on('end', () => {
            console.log('Stream ended.');
            if (this.ffmpegImageCapture && !this.ffmpegImageCapture.killed) {
              this.ffmpegImageCapture.stdin.end(); // 스트림 종료 신호 전송
            }
          });

          res.data.on('error', (error) => {
            console.error('Stream error:', error);
            if (this.ffmpegImageCapture) {
              this.ffmpegImageCapture.stdin.destroy(); // 강제 종료
              this.ffmpegImageCapture.kill(); // 프로세스 종료
            }
            reject(error);
          });

          // FFmpeg 프로세스 에러 로그 기록
          this.ffmpegImageCapture.stderr.on('data', (data) => {
            console.error(`FFmpeg stderr: ${data}`);
          });

          // FFmpeg stdin 에러 핸들링
          this.ffmpegImageCapture.stdin.on('error', (error) => {
            console.error('FFmpeg stdin error:', error);
          });

          // 스트림 데이터를 FFmpeg로 전달
          res.data.pipe(this.ffmpegImageCapture.stdin);

          // FFmpeg 종료 이벤트 핸들링
          this.ffmpegImageCapture.on('close', (code) => {
            this.ffmpegImageCapture = null;
            res.data.destroy();
            if (code === 0) {
              console.log('Image capture completed successfully.');
              resolve();
            } else {
              console.error(`FFmpeg process exited with code ${code}`);
              reject(new Error('Error during image capture.'));
            }
          });

          // FFmpeg 프로세스 에러 핸들링
          this.ffmpegImageCapture.on('error', (error) => {
            console.error('FFmpeg process error:', error);
            this.ffmpegImageCapture.kill(); // 프로세스 강제 종료
            reject(error);
          });
        })
        .catch((error) => {
          console.error('Error fetching video stream:', error.message);
          reject(new Error(error.message));
          // reject(new Error('Stream source is not responding or invalid.'));
        });
    });
  }

  private startVideoRecording(videoFilePath: string): Promise<void> {
    this.isRecording = true; // 녹화 상태 설정
    console.log('##########################################');
    return new Promise((resolve, reject) => {
      const response = this.httpService.get(
        'http://192.168.0.45:8080/stream.mjpg',
        {
          responseType: 'stream',
          headers: { Connection: 'close' },
        },
      );

      firstValueFrom(response)
        .then((res) => {
          if (!res || res.status !== 200) {
            console.error('Camera stream is unavailable.');
            this.isRecording = false;
            reject(new Error('Camera stream is unavailable.'));
            return;
          }

          this.ffmpegProcess = spawn('ffmpeg', [
            '-f',
            'mjpeg',
            '-i',
            'pipe:0', // 입력을 파이프 스트림으로 설정
            '-c:v',
            'libx264', // 비디오 코덱 설정
            '-preset',
            'fast', // 인코딩 속도 설정 (빠르게)
            '-pix_fmt',
            'yuv420p', // 픽셀 형식 설정
            videoFilePath, // 출력 비디오 파일 경로
          ]);

          res.data.on('end', () => {
            console.log('Stream ended.');
            if (this.ffmpegProcess && !this.ffmpegProcess.killed) {
              this.ffmpegProcess.stdin.end(); // 스트림 종료 신호 전송
            }
          });

          res.data.on('error', (error) => {
            console.error('Stream error:', error);
            if (this.ffmpegProcess) {
              this.ffmpegProcess.stdin.destroy(); // 강제 종료
              this.ffmpegProcess.kill(); // FFmpeg 프로세스 종료
            }
          });

          res.data.pipe(this.ffmpegProcess.stdin);

          this.ffmpegProcess.on('close', (code) => {
            this.isRecording = false; // 녹화 상태 해제
            this.ffmpegProcess = null; // 프로세스 상태 초기화
            res.data.destroy();
            if (code === 0) {
              console.log('Video saved successfully');
              resolve();
            } else {
              console.error(`FFmpeg process exited with code ${code}`);
              reject(new Error('Error during video conversion'));
            }
          });

          this.ffmpegProcess.on('error', (error) => {
            console.error('FFmpeg error:', error);
            if (this.ffmpegProcess) {
              this.ffmpegProcess.kill(); // FFmpeg 강제 종료
            }
            this.isRecording = false; // 녹화 상태 해제
            reject(error);
          });
        })
        .catch((error) => {
          this.isRecording = false; // 녹화 상태 해제
          console.error(
            'Error fetching video stream for video recording:',
            error,
          );
          reject(new Error('Camera is not responding or is turned off.'));
        });
    });
  }

  stopRecording(): void {
    if (this.ffmpegProcess && this.isRecording) {
      console.log('Stopping recording...');
      this.ffmpegProcess.stdin.end(); // FFmpeg의 입력 스트림을 종료 (더 이상 데이터 전달되지 않음)
      this.ffmpegProcess = null;
      this.isRecording = false;
      // setTimeout(() => {
      //   if (this.ffmpegProcess) {
      //     this.ffmpegProcess.kill(); // FFmpeg 프로세스를 종료
      //     this.ffmpegProcess = null; // 프로세스 변수 초기화
      //     this.isRecording = false; // 녹화 상태 해제
      //     console.log('Recording process terminated.');
      //   }
      // }, 5000); // 5초 대기 (필요시 조정 가능)
    } else {
      throw new Error('No recording in progress.');

      // console.log('No recording in progress.');
    }
  }

  // private readonly rootFolder = path.join(process.cwd(), 'video_storage');

  async generateVideoStorageData(): Promise<
    Array<{
      date: string;
      items: { time: string; thumbnail: string; extra: string }[];
    }>
  > {
    const videoStorage: Array<{
      date: string;
      items: { time: string; thumbnail: string; extra: string }[];
    }> = [];

    if (fs.existsSync(this.rootFolder)) {
      const dateFolders = fs.readdirSync(this.rootFolder, {
        withFileTypes: true,
      });

      for (const folder of dateFolders) {
        if (folder.isDirectory()) {
          const dateFolderPath = path.join(this.rootFolder, folder.name);
          const recordFolders = fs.readdirSync(dateFolderPath, {
            withFileTypes: true,
          });

          const items: { time: string; thumbnail: string; extra: string }[] =
            [];

          for (const recordFolder of recordFolders) {
            if (recordFolder.isDirectory()) {
              const recordFolderPath = path.join(
                dateFolderPath,
                recordFolder.name,
              );
              const thumbnailPath = path.join(
                recordFolderPath,
                'thumbnail.jpg',
              );
              const extraPath = path.join(recordFolderPath, 'extra.mp4');

              if (fs.existsSync(thumbnailPath) && fs.existsSync(extraPath)) {
                const base64Thumbnail = await getBase64Thumbnail(thumbnailPath);
                items.push({
                  thumbnail: base64Thumbnail,
                  extra: path.basename(extraPath),
                  time: path.basename(recordFolderPath),
                });
              }
            }
          }

          if (items.length > 0) {
            videoStorage.push({ date: path.basename(dateFolderPath), items });
          }
        }
      }
    }

    return videoStorage.reverse();
  }
}
