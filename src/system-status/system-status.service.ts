import { BadRequestException, Injectable } from '@nestjs/common';
import { SystemStatusRequest } from './dto/system-status.request';
import { CheckSheetMongoRepository } from 'src/check-sheet/check-sheet.repository';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { WorkPlanMongoRepository } from 'src/work-plan/work-plan.repository';
import { filterTodayData } from 'src/lib/filterTodayData';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import { SystemStatus } from './entities/system-status.schema';
import { SystemStatusMongoRepository } from './system-status.repository';

@Injectable()
export class SystemStatusService {
  constructor(
    private checkSheetRepository: CheckSheetMongoRepository,
    private userRepository: usersMongoRepository,
    private workPlanRepository: WorkPlanMongoRepository,
    private equipmentRepository: HeavyEquipmentMongoRepository,
    private systemStatusRepository: SystemStatusMongoRepository,
  ) {}

  create(systemStatusRequest: SystemStatusRequest) {
    return 'This action adds a new systemStatus';
  }

  findAll() {
    return `This action returns all systemStatus`;
  }

  async update(systemStatusRequest: SystemStatusRequest) {
    try {
      const { equipmentId, userId } = systemStatusRequest;
      const isEquipment = await this.equipmentRepository.exists([equipmentId]);
      if (!isEquipment)
        throw new BadRequestException('해당 중장비 id가 존재하지 않습니다.');

      const user = await this.userRepository.findOne(userId);
      if (!user)
        throw new BadRequestException('해당 사용자 id가 존재하지 않습니다.');
      // 오늘 checkSheet인지 확인
      const LatestCheckSheet =
        await this.checkSheetRepository.findOneLatest(equipmentId);
      const checkSheet = filterTodayData(LatestCheckSheet);

      // 오늘이 포함된 작업계획서가 존재
      const workPlan =
        await this.workPlanRepository.findOneLatestNotPopulate(equipmentId);

      const startDay = workPlan?.mutableData?.startDay;
      const endDay = workPlan?.mutableData?.endDay;
      const today = new Date().toISOString().split('T')[0];

      const isWithinRange = today >= startDay && today <= endDay;

      // const driver = workPlan?.driverSignatures?.map(
      //   (item, _) => item.driver as unknown as UserInfo,
      // );
      console.log(isWithinRange, '--------------');

      const driverSignature = workPlan?.driverSignatures?.find(
        (item) => item.driver.toString() === userId,
      );

      // console.log(workPlan.driverSignatures);

      // console.log(driverSignature, 'driverSignature');

      const systemStatus: SystemStatus = {
        hasValidCheck: checkSheet?.issue != null,
        hasValidWorkPlan: isWithinRange,
        isSignedWorkPlan: isWithinRange
          ? workPlan?.adminSignatures?.finish
            ? true
            : false
          : false,
        isValidUser: isWithinRange
          ? workPlan?.driverSignatures?.some(
              (item) => item.driver.toString() === userId,
            )
          : false,
        isSignedUser: isWithinRange
          ? driverSignature?.urlMode
            ? true
            : false
          : false,
      };

      console.log(systemStatus, 'systemStatus');

      return await this.systemStatusRepository.update(systemStatus);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} systemStatus`;
  }
}
