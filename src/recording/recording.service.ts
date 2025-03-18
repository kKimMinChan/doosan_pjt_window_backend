import { Injectable } from '@nestjs/common';
import { CameraBeIpRequest, RecordingRequest } from './dto/recording.request';
import { RecordingMongoRepository } from './recording.repository';
import { Recording } from './entities/recording.schema';

@Injectable()
export class RecordingService {
  constructor(private recordingRepository: RecordingMongoRepository) {}

  async findAll() {
    return await this.recordingRepository.findAll();
  }

  async update(updateRecordingDto: RecordingRequest) {
    const updateIp: Partial<Recording> = {
      ip: updateRecordingDto.ip,
    };
    return await this.recordingRepository.update(updateIp);
  }

  async remove() {
    return await this.recordingRepository.remove();
  }

  async updateCameraBe(updateRecordingDto: CameraBeIpRequest) {
    const updateCameraBeIp: Partial<Recording> = {
      cameraBeIp: updateRecordingDto.cameraBeIp,
    };

    return await this.recordingRepository.update(updateCameraBeIp);
  }

  async removeCameraBe() {
    return await this.recordingRepository.remove();
  }
}
