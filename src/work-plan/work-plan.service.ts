import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminSignatureRequest,
  DriverSignatureRequest,
  WorkPlanDetailsRequest,
  WorkPlanPaginationDto,
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
      console.log(workPlanDto, 'workPlanDto --------------');
      if (!workPlanDto.mutableData || !workPlanDto.fixedData)
        throw new BadRequestException('데이터를 입력해주세요.');
      console.log(workPlanDto);

      const isEquipment = await this.heavyEquipmentRepository.exists(
        workPlanDto.equipment,
      );

      if (!isEquipment)
        throw new NotFoundException('해당 id의 중장비가 존재하지 않습니다.');

      const workPlan: Partial<WorkPlan> = {
        mutableData: workPlanDto.mutableData,
        fixedData: workPlanDto.fixedData,
        equipment: workPlanDto.equipment,
        driverSignatures: workPlanDto.driverSignatures,
        adminSignatures: {
          create: null,
          finish: null,
        },
      };
      if (!isEquipment) delete workPlan.equipment;
      console.log(workPlan);
      return await this.workPlanRepository.create(workPlan);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll(id: string, paginationDto: WorkPlanPaginationDto) {
    try {
      await this.heavyEquipmentRepository.findOne(id);

      const { page, limit, order, inspectionStatus, startDay, endDay } =
        paginationDto;

      const today = new Date().toISOString();
      const includingTodayWorkPlan =
        await this.workPlanRepository.findTodayEntry(id);
      const todayId = includingTodayWorkPlan?._id?.toString();

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.workPlanRepository.findAll(
          id,
          skip,
          limit,
          todayId,
          order,
          inspectionStatus,
          startDay,
          endDay,
        ),
        this.workPlanRepository.countWorkPlan(
          id,
          todayId,
          inspectionStatus,
          startDay,
          endDay,
        ),
      ]);

      // console.log(data, '-------', totalCount);

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

  async findTodayEntry(id: string) {
    try {
      await this.heavyEquipmentRepository.findOne(id);
      const workPlan = await this.workPlanRepository.findTodayEntry(id);
      console.log(workPlan, 'including');
      return workPlan;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async updateDetails(id: string, workPlanDto: WorkPlanDetailsRequest) {
    try {
      console.log(id, workPlanDto, '--------');

      const { equipment, mutableData, fixedData, driverSignatures } =
        workPlanDto;

      const isEquipment = await this.heavyEquipmentRepository.exists(equipment);
      if (!isEquipment)
        throw new NotFoundException('해당 id의 중장비가 존재하지 않습니다.');

      const workPlan: Partial<WorkPlan> = {
        equipment,
        mutableData,
        fixedData,
        driverSignatures,
        adminSignatures: {
          create: null,
          finish: null,
        },
      };
      if (!isEquipment) delete workPlan.equipment;
      if (!mutableData) delete workPlan.mutableData;
      if (!fixedData) delete workPlan.fixedData;
      // if (!driverSignatures) delete workPlan.driverSignatures

      console.log(equipment, mutableData, fixedData, '------------', workPlan);
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
    files: { dark?: Express.MulterS3.File[]; white?: Express.MulterS3.File[] },
  ) {
    try {
      const { dark = [], white = [] } = files ?? {};

      if (dark.length === 0 && white.length === 0)
        throw new BadRequestException(
          '서명 이미지 파일을 전달받지 못했습니다.',
        );

      const urlMode = {
        dark:
          dark.length > 0
            ? process.env.NODE_ENV === 'production'
              ? dark[0].path
              : dark[0].key
            : null,
        white:
          white.length > 0
            ? process.env.NODE_ENV === 'production'
              ? white[0].path
              : white[0].key
            : null,
        // dark: dark.length > 0 ? dark[0].key : null,
        // white: white.length > 0 ? white[0].key : null,
      };

      console.log(id, body.type, urlMode);

      return await this.workPlanRepository.updateAdminSignature(
        id,
        body.type,
        urlMode,
      );
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async driverSignature(
    id: string,
    body: DriverSignatureRequest,
    files: { dark?: Express.MulterS3.File[]; white?: Express.MulterS3.File[] },
  ) {
    try {
      const { dark = [], white = [] } = files ?? {};

      if (dark.length === 0 && white.length === 0)
        throw new BadRequestException(
          '서명 이미지 파일을 전달받지 못했습니다.',
        );

      console.log(files, '-----------------');

      const urlMode = {
        dark:
          dark.length > 0
            ? process.env.NODE_ENV === 'production'
              ? dark[0].path
              : dark[0].key
            : null,
        white:
          white.length > 0
            ? process.env.NODE_ENV === 'production'
              ? white[0].path
              : white[0].key
            : null,
      };
      const user = await this.userRepository.findOne(body.driver);
      if (!user)
        throw new NotFoundException('해당 id의 사용자가 존재하지 않습니다.');
      return await this.workPlanRepository.updateSignature(
        id,
        body.driver,
        urlMode,
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
