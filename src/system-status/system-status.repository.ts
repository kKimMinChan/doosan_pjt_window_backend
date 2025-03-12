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
    return await this.systemStatusModel.replaceOne(
      {}, // ✅ 모든 문서를 대상으로 적용 (즉, 하나만 유지)
      systemStatus, // ✅ 새로운 데이터로 교체
      { upsert: true }, // ✅ 기존 문서가 없으면 새로 생성
    );
  }
}
