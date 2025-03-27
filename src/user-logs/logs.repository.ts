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

    const pipeline: any[] = [];

    pipeline.push({ $match: { event } });
    pipeline.push(
      {
        $sort: { createdAt: sortOrder },
      },
      { $skip: skip },
      { $limit: limit },
    );

    pipeline.push(
      {
        $lookup: {
          from: 'userinfos',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    pipeline.push(
      {
        $lookup: {
          from: 'heavyequipments', // 💡 컬렉션 이름 정확하게!
          localField: 'equipment',
          foreignField: '_id',
          as: 'equipment',
        },
      },
      {
        $unwind: {
          path: '$equipment',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    pipeline.push(
      {
        $addFields: {
          'user.id': '$user._id',
          'equipment.id': '$equipment._id',
          id: '$_id',
        },
      },
      {
        $unset: ['_id', 'user._id', 'equipment._id'],
      },
    );

    pipeline.push({
      $addFields: {
        user: {
          $cond: { if: { $eq: ['$user', {}] }, then: null, else: '$user' },
        },
        equipment: {
          $cond: {
            if: { $eq: ['$equipment', {}] },
            then: null,
            else: '$equipment',
          },
        },
      },
    });

    const userLogs = await this.userLogModel.aggregate(pipeline);

    // const userLogs = await this.userLogModel
    //   .find({ event })
    //   .sort({ createdAt: sortOrder })
    //   .skip(skip)
    //   .limit(limit)
    //   .populate('user')
    //   .exec();
    return userLogs;
  }

  async countUserLogs(event: EventType) {
    return this.userLogModel.countDocuments({ event }).exec();
  }
}
