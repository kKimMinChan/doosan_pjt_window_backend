import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserLog, UserLogDocument, EventType } from './entities/log.schema';
import { Model, SortOrder } from 'mongoose';

export interface UserLogsRepository {
  createLog(userLog: Partial<UserLog>);
  findAllPaginated(
    skip: number,
    limit: number,
    order: string,
    event: EventType,
  );
  countUserLogs(event: EventType);
}

@Injectable()
export class userLogsMongoRepository implements UserLogsRepository {
  constructor(
    @InjectModel(UserLog.name)
    private userLogModel: Model<UserLogDocument>,
  ) {}
  async createLog(userLog: Partial<UserLog>) {
    const newUserLog = await new this.userLogModel(userLog).save();
    return newUserLog;
  }

  async findAllPaginated(
    skip: number,
    limit: number,
    order: string,
    event: EventType,
  ) {
    const sortOrder: SortOrder = order === 'asc' ? 1 : -1;

    const userLogs = await this.userLogModel
      .find({ event })
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('user')
      .exec();
    return userLogs;
  }

  async countUserLogs(event: EventType) {
    return this.userLogModel.countDocuments({ event }).exec();
  }
}
