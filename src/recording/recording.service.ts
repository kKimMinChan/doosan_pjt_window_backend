import { Injectable } from '@nestjs/common';
import { RecordingRequest } from './dto/recording.request';
import { RecordingMongoRepository } from './recording.repository';

@Injectable()
export class RecordingService {
  constructor(private recordingRepository: RecordingMongoRepository) {}

  // create(createRecordingDto: RecordingRequest) {
  //   return 'This action adds a new recording';
  // }

  async findAll() {
    return await this.recordingRepository.findAll();
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} recording`;
  // }

  async update(updateRecordingDto: RecordingRequest) {
    return await this.recordingRepository.update(updateRecordingDto);
  }

  async remove() {
    return await this.recordingRepository.remove();
  }
}
