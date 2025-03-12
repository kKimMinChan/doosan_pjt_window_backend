import { Injectable } from '@nestjs/common';
import { Recording, RecordingDocument } from './entities/recording.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface RecordingRepository {
  findAll();
  update(ips: Recording);
  remove();
}

@Injectable()
export class RecordingMongoRepository implements RecordingRepository {
  constructor(
    @InjectModel(Recording.name)
    private recordingModel: Model<RecordingDocument>,
  ) {}

  async findAll() {
    return await this.recordingModel.findOne().exec();
  }

  async update(ips: Recording) {
    return await this.recordingModel.replaceOne(
      {}, // ✅ 모든 문서를 대상으로 적용 (즉, 하나만 유지)
      ips, // ✅ 새로운 데이터로 교체
      { upsert: true }, // ✅ 기존 문서가 없으면 새로 생성
    );
  }

  async remove() {
    return await this.recordingModel.deleteOne().exec();
  }
}
