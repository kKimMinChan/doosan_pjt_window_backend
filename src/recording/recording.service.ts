import { Injectable } from '@nestjs/common';
import { CreateRecordingDto } from './dto/recording.request';
import { UpdateRecordingDto } from './dto/recording.response';

@Injectable()
export class RecordingService {
  create(createRecordingDto: CreateRecordingDto) {
    return 'This action adds a new recording';
  }

  findAll() {
    return `This action returns all recording`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recording`;
  }

  update(id: number, updateRecordingDto: UpdateRecordingDto) {
    return `This action updates a #${id} recording`;
  }

  remove(id: number) {
    return `This action removes a #${id} recording`;
  }
}
