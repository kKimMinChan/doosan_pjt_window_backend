import { Injectable } from '@nestjs/common';
import { RecordingRequest } from './dto/recording.request';
import { RecordingMongoRepository } from './recording.repository';
import { Recording } from './entities/recording.schema';

@Injectable()
export class RecordingService {
  constructor(private recordingRepository: RecordingMongoRepository) {}

  async findAll() {
    return await this.recordingRepository.findAll();
  }

  async update(updateRecordingDto: RecordingRequest) {
    console.log(updateRecordingDto, 'dto');
    const updateIp: Partial<Recording> = {
      cameraIps: updateRecordingDto?.cameraIps,
      pythonServerIps: updateRecordingDto?.pythonServerIps,
    };
    console.log(updateIp, 'update');
    return await this.recordingRepository.update(updateIp);
  }

  async remove() {
    return await this.recordingRepository.remove();
  }

  // async updateCameraBe(updateRecordingDto: CameraBeIpRequest) {
  //   const updateCameraBeIp: Partial<Recording> = {
  //     cameraStatusTargets: updateRecordingDto.cameraStatusTargets,
  //   };

  //   return await this.recordingRepository.update(updateCameraBeIp);
  // }

  // async removeCameraBe() {
  //   return await this.recordingRepository.remove();
  // }
}
