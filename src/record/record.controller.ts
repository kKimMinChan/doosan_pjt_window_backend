import {
  Controller,
  Get,
  Res,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { RecordDto } from './record.dto';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Get('/start')
  @ApiOperation({
    summary: '녹화 시작',
    description: '녹화 시작',
  })
  async startRecording(@Res() res: Response) {
    // 녹화를 백그라운드에서 시작
    try {
      await this.recordService.startRecording();

      console.log('Recording started successfully in background.');
      res.status(200).send('Recording started successfully in background.');

      // this.recordService
      //   .startRecording()
      //   .then(() => {
      //     console.log('Recording started successfully in background.');
      //   })
      //   .catch((error) => {
      //     console.error(
      //       `Error starting recording in background: ${error.message}`,
      //     );
      //     throw new HttpException(
      //       '녹화를 시작할 수 없습니다. 카메라가 꺼져 있습니다.',
      //       HttpStatus.BAD_REQUEST,
      //     );
      //   });

      // // 즉시 응답 반환
      // res.status(200).send('Recording started successfully in background.');
    } catch (error) {
      if (error.message.includes('connect ETIMEDOUT')) {
        throw new HttpException(
          '녹화를 시작할 수 없습니다. 카메라가 꺼져 있습니다.',
          HttpStatus.BAD_REQUEST,
          {
            cause: error,
          },
        );
      } else {
        throw new HttpException(
          `Error starting recording: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/stop')
  @ApiOperation({
    summary: '녹화 중지',
    description: '녹화 중지',
  })
  stopRecording(@Res() res: Response) {
    try {
      // 녹화 중지
      this.recordService.stopRecording();
      res.status(200).send('Recording stopped successfully.');
    } catch (error) {
      throw new HttpException(
        error.message || `Error starting recording: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiCreatedResponse({
    description: '모든 녹화 데이터',
    type: [RecordDto],
  })
  getAllVideos() {
    return this.recordService.generateVideoStorageData();
  }

  @Get('play')
  @ApiOperation({
    summary: '녹화 영상 스트림',
    description: '녹화 영상 스트림',
  })
  @ApiQuery({
    name: 'foldName',
    type: String,
    description: '해당 년-월-일/시-분-초 -> 2024-12-04/11_59_52',
    required: true, // 필수인지 여부
  })
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
