import { Injectable } from '@nestjs/common';
import { UserLogPaginationDto, UserLogRequest } from './dto/log.request';
import { UserLogResponse } from './dto/log.response';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import { userLogsMongoRepository } from './logs.repository';
import { UserLog } from './entities/log.schema';
import { usersMongoRepository } from 'src/admin/user/user.repository';

@Injectable()
export class LogsService {
  constructor(
    private userLogsRepository: userLogsMongoRepository,
    private usersRepository: usersMongoRepository,
  ) {}

  async create(createLogDto: UserLogRequest, file: Express.MulterS3.File) {
    try {
      console.log(createLogDto, file);
      const missUser = await this.usersRepository.findMissingUsers([
        createLogDto.user.toString(),
      ]);

      console.log(missUser, 'missUser');

      const userLog: Partial<UserLog> = {
        event: createLogDto.event,
        result: createLogDto?.result,
        user: missUser.length > 0 ? null : createLogDto.user,
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
