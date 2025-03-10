import { Injectable } from '@nestjs/common';
import { SystemStatusRequest } from './dto/system-status.request';
import { CheckSheetMongoRepository } from 'src/check-sheet/check-sheet.repository';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';
import { WorkPlanMongoRepository } from 'src/work-plan/work-plan.repository';
import { today } from 'src/lib/today';

@Injectable()
export class SystemStatusService {
  constructor(
    private checkSheetRepository: CheckSheetMongoRepository,
    private userRepository: usersMongoRepository,
    private workPlanRepository: WorkPlanMongoRepository,
  ) {}

  create(systemStatusRequest: SystemStatusRequest) {
    return 'This action adds a new systemStatus';
  }

  findAll() {
    return `This action returns all systemStatus`;
  }

  async findOne(systemStatusRequest: SystemStatusRequest) {
    const { equipmentId, userId } = systemStatusRequest;

    const user = await this.userRepository.findOne(userId);
    // 오늘 checkSheet인지 확인
    const LatestCheckSheet =
      await this.checkSheetRepository.findOneLatest(equipmentId);

    const checkSheet = today(LatestCheckSheet);

    console.log(checkSheet, 'system-status-checkSheet');

    // 오늘이 포함된 작업계획서가 존재
    const workPlan = await this.workPlanRepository.findOneLatest(equipmentId);

    return `This action returns a # systemStatus`;
  }

  update() {
    return `This action updates a # systemStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} systemStatus`;
  }
}
