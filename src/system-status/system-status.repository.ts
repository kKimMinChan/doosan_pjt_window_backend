import { Injectable } from '@nestjs/common';
import {
  SystemStatus,
  SystemStatusDocument,
} from './entities/system-status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface SystemStatusRepository {
  update(systemStatus: SystemStatus);
}

@Injectable()
export class SystemStatusMongoRepository implements SystemStatusRepository {
  constructor(
    @InjectModel(SystemStatus.name)
    private systemStatusModel: Model<SystemStatusDocument>,
  ) {}

  async update(systemStatus: SystemStatus) {
    const session = await this.systemStatusModel.startSession();
    session.startTransaction();
    try {
      await this.systemStatusModel.deleteMany({}, { session }); // ✅ 기존 문서 삭제
      const newRecord = await this.systemStatusModel.create([systemStatus], {
        session,
      }); // ✅ 새 문서 생성
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
