// src/modules/recording/recording.seed.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recording, RecordingDocument } from './entities/recording.schema';

@Injectable()
export class RecordingSeedService {
  private readonly logger = new Logger(RecordingSeedService.name);

  constructor(
    @InjectModel(Recording.name)
    private recordingModel: Model<RecordingDocument>,
  ) {}

  async seed() {
    const count = await this.recordingModel.countDocuments();
    if (count === 0) {
      await this.recordingModel.create({
        recordingTargets: [],
        cameraStatusTargets: [],
      });
      this.logger.log('Recording 초기 데이터 생성 완료');
    } else {
      this.logger.log('Recording 데이터가 이미 존재합니다.');
    }
  }
}
