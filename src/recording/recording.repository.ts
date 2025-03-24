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

  async update(ips: Partial<Recording>) {
    return await this.recordingModel.updateOne(
      {}, // ✅ 조건 (첫 번째 문서 선택)
      { $set: ips }, // ✅ 기존 데이터 유지하면서 `ip`만 변경
      { upsert: true }, // ✅ 기존 문서 없으면 생성
    );
  }

  async remove() {
    return await this.recordingModel.deleteOne().exec();
  }
}
