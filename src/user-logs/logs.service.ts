import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/log.request';
import { UpdateLogDto } from './dto/log.response';

@Injectable()
export class LogsService {
  create(createLogDto: CreateLogDto) {
    return 'This action adds a new log';
  }

  findAll() {
    return `This action returns all logs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }
}
