import { Controller, Get, Res, Param, Query } from '@nestjs/common';
import { RecordService } from './record.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Get('/start')
  startRecording(@Res() res: Response) {
    // 녹화를 백그라운드에서 시작
    try {
      this.recordService
        .startRecording()
        .then(() => {
          console.log('Recording started successfully in background.');
        })
        .catch((error) => {
          console.error(
            `Error starting recording in background: ${error.message}`,
          );
        });

      // 즉시 응답 반환
      res.status(200).send('Recording started successfully in background.');
    } catch (error) {
      res.status(500).send(`Error starting recording: ${error.message}`);
    }
  }

  @Get('/stop')
  stopRecording(@Res() res: Response) {
    try {
      // 녹화 중지
      this.recordService.stopRecording();
      res.status(200).send('Recording stopped successfully.');
    } catch (error) {
      res.status(500).send(`Error stopping recording: ${error.message}`);
    }
  }

  @Get()
  getAllVideos() {
    return this.recordService.generateVideoStorageData();
  }

  @Get('play')
  streamVideo(@Query('foldName') foldName: string, @Res() res: Response) {
    // 경로에서 날짜 및 시간 폴더 정보를 추출하여 파일 경로를 설정
    const videoPath = path.join(
      process.cwd(),
      'video_storage',
      foldName,
      'extra.mp4',
    );

    if (fs.existsSync(videoPath)) {
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = res.req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } else {
      res.status(404).send('Video not found');
    }
  }
}
