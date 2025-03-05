import { Injectable } from '@nestjs/common';
import { Recording, RecordingDocument } from './entities/recording.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface RecordingRepository {
  findAll();
  update(ips: Recording);
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
    const session = await this.recordingModel.startSession();
    session.startTransaction();
    try {
      await this.recordingModel.deleteMany({}, { session }); // ✅ 기존 문서 삭제
      const newRecord = await this.recordingModel.create([ips], { session }); // ✅ 새 문서 생성
      await session.commitTransaction();
      session.endSession();
      return newRecord;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
