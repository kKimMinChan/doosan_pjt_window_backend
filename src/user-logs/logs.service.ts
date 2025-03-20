import { Injectable } from '@nestjs/common';
import { UserLogPaginationDto, UserLogRequest } from './dto/log.request';
import { UserLogResponse } from './dto/log.response';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import { userLogsMongoRepository } from './logs.repository';
import { UserLog } from './entities/log.schema';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import mongoose from 'mongoose';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';

@Injectable()
export class LogsService {
  constructor(
    private userLogsRepository: userLogsMongoRepository,
    private usersRepository: usersMongoRepository,
    private equipmentRepository: HeavyEquipmentMongoRepository,
  ) {}

  async create(createLogDto: UserLogRequest, file: Express.MulterS3.File) {
    try {
      console.log(createLogDto, file);

      // user 값을 저장할 변수 선언 (기본값은 null)
      let userValue: mongoose.Types.ObjectId | null = null;
      let equipmentValue: mongoose.Types.ObjectId | null = null;

      // createLogDto.user가 올바른 ObjectId 형식이면
      if (mongoose.Types.ObjectId.isValid(createLogDto.user)) {
        // 누락된 사용자가 있는지 조회 (user ID를 문자열로 변환)
        const missUser = await this.usersRepository.findMissingUsers([
          createLogDto.user.toString(),
        ]);
        console.log(missUser, 'missUser');

        // 누락된 사용자가 있으면 userValue는 null, 없으면 createLogDto.user 할당
        userValue = missUser.length > 0 ? null : createLogDto.user;
      } else {
        // createLogDto.user가 유효하지 않으면 null 할당
        userValue = null;
      }

      if (mongoose.Types.ObjectId.isValid(createLogDto.equipment)) {
        // 누락된 사용자가 있는지 조회 (user ID를 문자열로 변환)
        const equipment = await this.equipmentRepository.findOne(
          createLogDto.equipment.toString(),
        );

        // 누락된 사용자가 있으면 userValue는 null, 없으면 createLogDto.user 할당
        equipmentValue = equipment ? createLogDto.equipment : null;
      } else {
        // createLogDto.user가 유효하지 않으면 null 할당
        equipmentValue = null;
      }

      const userLog: Partial<UserLog> = {
        event: createLogDto.event,
        result: createLogDto?.result,
        user: userValue,
        equipment: equipmentValue,
        imageUrl:
          process.env.NODE_ENV === 'production'
            ? 'path' in file
              ? file.path
              : null
            : 'key' in file
              ? file.key
              : null,
      };

      return await this.userLogsRepository.createLog(userLog);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll(userLogPaginationDto: UserLogPaginationDto) {
    try {
      const { limit, order, page, event } = userLogPaginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.userLogsRepository.findAllPaginated(skip, limit, order, event),
        this.userLogsRepository.countUserLogs(event),
      ]);

      return {
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        page,
        data,
      };
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOne(id: number) {
    try {
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async remove(id: number) {
    try {
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }
}
