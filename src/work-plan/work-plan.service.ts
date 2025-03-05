import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminSignatureRequest,
  DriverSignatureRequest,
  WorkPlanDetailsRequest,
  WorkPlanRequest,
} from './dto/work-plan.request';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import { WorkPlanMongoRepository } from './work-plan.repository';
import { WorkPlan } from './entities/work-plan.schema';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';

@Injectable()
export class WorkPlanService {
  constructor(
    private workPlanRepository: WorkPlanMongoRepository,
    private userRepository: usersMongoRepository,
    private heavyEquipmentRepository: HeavyEquipmentMongoRepository,
  ) {}
  async create(workPlanDto: WorkPlanRequest) {
    try {
      if (!workPlanDto.data)
        throw new BadRequestException('데이터를 입력해주세요.');
      console.log(workPlanDto);

      const workPlan: Partial<WorkPlan> = {
        workPlanData: workPlanDto.data,
        equipment: workPlanDto.equipment,
      };
      if (!workPlanDto.equipment) delete workPlan.equipment;
      console.log(workPlan);
      return await this.workPlanRepository.create(workPlan);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll(id: string, paginationDto: PaginationDto) {
    try {
      const { page, limit } = paginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.workPlanRepository.findAll(id, skip, limit),
        this.workPlanRepository.countWorkPlan(id),
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

  async findOne(id: string) {
    try {
      const workPlan = await this.workPlanRepository.findOne(id);
      return workPlan;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async updateDetails(id: string, workPlanDto: WorkPlanDetailsRequest) {
    try {
      const { equipment, data } = workPlanDto;

      const isEquipment =
        await this.heavyEquipmentRepository.findOne(equipment);

      const workPlan: Partial<WorkPlan> = {
        equipment,
        workPlanData: data,
      };
      if (!isEquipment) delete workPlan.equipment;
      if (!data) delete workPlan.workPlanData;
      console.log(equipment, data, '------------', workPlan);
      const result = await this.workPlanRepository.updateDetails(id, workPlan);
      if (result.matchedCount === 0)
        throw new NotFoundException(
          '해당 id의 작업 계획서가 존재하지 않습니다.',
        );

      if (result.modifiedCount === 0) {
        return {
          translate: '요청이 완료되었지만 변경된 내용이 없습니다.',
          message: 'No Changes',
        };
      }
      return {
        translate: '요청이 성공적으로 완료되었습니다.',
      };
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async adminSignature(
    id: string,
    body: AdminSignatureRequest,
    file: Express.MulterS3.File,
  ) {
    try {
      if (!file)
        throw new BadRequestException(
          '서명 이미지 파일을 전달받지 못했습니다.',
        );

      const url = `${file.key}`;
      return await this.workPlanRepository.updateSignature(
        id,
        'adminSignatures',
        body.type,
        url,
      );
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async driverSignature(
    id: string,
    body: DriverSignatureRequest,
    file: Express.MulterS3.File,
  ) {
    try {
      if (!file)
        throw new BadRequestException(
          '서명 이미지 파일을 전달받지 못했습니다.',
        );

      const url = `${file.key}`;
      const user = await this.userRepository.findOne(body.driver);
      if (!user)
        throw new NotFoundException('해당 id의 사용자가 존재하지 않습니다.');
      return await this.workPlanRepository.updateSignature(
        id,
        'driverSignatures',
        body.driver,
        url,
      );
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.workPlanRepository.remove(id);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }
}
