import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkPlanRequest } from './dto/work-plan.request';
import { UpdateWorkPlanDto } from './dto/work-plan.response';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import { WorkPlanMongoRepository } from './work-plan.repository';
import { WorkPlan } from './entities/work-plan.schema';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { PaginationDto } from 'src/common-dto/pagination.dto';

@Injectable()
export class WorkPlanService {
  constructor(
    private workPlanRepository: WorkPlanMongoRepository,
    private userRepository: usersMongoRepository,
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
        this.workPlanRepository.countWorkPlan(),
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

  async updateSignature(id: string, body: any, file: Express.MulterS3.File) {
    try {
      if ((body.type && body.driver) || (!body.type && !body.driver)) {
        throw new BadRequestException(
          'type 또는 driver 중 하나만 존재해야 합니다.',
        );
      }
      if (!file)
        throw new BadRequestException(
          '서명 이미지 파일을 전달받지 못했습니다.',
        );

      const url = `https://${process.env.CLOUDFRONT_URL}/${file.key}`;
      if (body.type) {
        return await this.workPlanRepository.updateSignature(
          id,
          'adminSignatures',
          body.type,
          url,
        );
      } else {
        const user = await this.userRepository.findOne(body.driver);
        if (!user)
          throw new NotFoundException('해당 id의 사용자가 존재하지 않습니다.');
        return await this.workPlanRepository.updateSignature(
          id,
          'driverSignatures',
          body.driver,
          url,
        );
      }
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      return `This action returns all workPlan`;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }
}
