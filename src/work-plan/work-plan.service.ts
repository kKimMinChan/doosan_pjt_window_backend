import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminSignatureRequest,
  AssignEquipmentRequest,
  DriverSignatureRequest,
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
  async create(body: any, file: Express.MulterS3.File) {
    try {
      console.log(body, file);
      if (!file)
        throw new BadRequestException(
          '작업 계획서 이미지 파일을 전달받지 못했습니다.',
        );
      const workPlanUrl = `https://${process.env.CLOUDFRONT_URL}/${file.key}`;
      const workPlanDto: Partial<WorkPlan> = {
        workPlanData: { url: workPlanUrl },
        heavyEquipment: body.heavyEquipment,
      };

      if (!body.heavyEquipment) delete workPlanDto.heavyEquipment;

      console.log(workPlanDto);
      return await this.workPlanRepository.create(workPlanDto);
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

  async assignEquipment(
    id: string,
    assignEquipmentDto: AssignEquipmentRequest,
  ) {
    try {
      const { heavyEquipment } = assignEquipmentDto;
      const equipment =
        await this.heavyEquipmentRepository.findOne(heavyEquipment);
      if (!equipment)
        throw new NotFoundException('해당 id의 중장비가 존재하지 않습니다.');
      const workPlanDto: Partial<WorkPlan> = {
        heavyEquipment,
      };
      const result = await this.workPlanRepository.assignEquipment(
        id,
        workPlanDto,
      );
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

      const url = `https://${process.env.CLOUDFRONT_URL}/${file.key}`;
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

      const url = `https://${process.env.CLOUDFRONT_URL}/${file.key}`;
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
