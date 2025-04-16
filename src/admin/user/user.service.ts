import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  UpdateUserRequest,
  UserFindRoleDto,
  UserPaginationDto,
  UserRequest,
} from './dto/request.dto';
import { usersMongoRepository } from './user.repository';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { CheckSheetMongoRepository } from 'src/check-sheet/check-sheet.repository';
import { WorkPlanMongoRepository } from 'src/work-plan/work-plan.repository';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';
import { inspect } from 'util';

@Injectable()
export class UserService {
  constructor(
    private usersRepository: usersMongoRepository,
    private checkSheetRepository: CheckSheetMongoRepository,
    private equipmentRepository: HeavyEquipmentMongoRepository,
    private workPlanRepository: WorkPlanMongoRepository,
  ) {}
  async createUser(userInfo: UserRequest, userFile: Express.MulterS3.File) {
    try {
      if (!userFile)
        throw new HttpException(
          '프로필 이미지를 업로드해야 합니다.',
          HttpStatus.BAD_REQUEST,
        );
      console.log(userFile, process.env.NODE_ENV, 'userFile');
      const { file, ...rest } = {
        ...userInfo,
        imageUrl:
          process.env.NODE_ENV === 'production'
            ? 'path' in userFile
              ? userFile.path
              : null
            : 'key' in userFile
              ? userFile.key
              : null,
      };

      console.log(rest, 'rest');

      const result = await this.usersRepository.createUser(rest);
      console.log(result, 'result');
      if (!result) {
        throw new HttpException(
          '사용자 생성에 실패했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAllPaginated(userPaginationDto: UserPaginationDto) {
    try {
      const { limit, page, role } = userPaginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.usersRepository.findAllPaginated(skip, limit, role),
        this.usersRepository.countUsers(role),
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

  async findRoleAll(userFindRoleDto: UserFindRoleDto) {
    try {
      const { role } = userFindRoleDto;
      return await this.usersRepository.findRoleAll(role);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll() {
    try {
      return await this.usersRepository.findAll();
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.usersRepository.findOne(id);
    } catch (error) {
      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }
      ErrorHelper.handleError(error);
    }
  }

  async update(
    id: string,
    userInfo: UpdateUserRequest,
    userFile: Express.MulterS3.File,
  ) {
    try {
      const updateData = {
        ...userInfo,
        ...(userFile && {
          imageUrl:
            process.env.NODE_ENV === 'production'
              ? 'path' in userFile
                ? userFile.path
                : null
              : 'key' in userFile
                ? userFile.key
                : null,
        }),
      };
      const user = await this.usersRepository.findOne(id);
      const userObjectId = new mongoose.Types.ObjectId(id);

      // 모든 중장비 찾아서 id로 변경
      const findAllEquipment = await this.equipmentRepository.findAll();
      const equipmentIds = findAllEquipment.map((item) => item._id.toString());

      console.log(equipmentIds, 'equipments');

      // 진행중인 작업계획서에 해당하는 것 모두 찾기
      const workPlanData =
        await this.workPlanRepository.findAllTodayEntry(equipmentIds);

      // console.log(workPlanData, 'workPlanData');

      // 삭제하려는 유저가 진행 중인 작업 게획서의 작성자인지 확인
      const isWriter = workPlanData.filter(
        (item) =>
          item?.mutableData?.writer?.toString() === userObjectId?.toString(),
      );

      // 삭제하려는 유저가 진행 중인 작업 계획서의 운전자인지 확인
      const isDriver = workPlanData.flatMap((plan) =>
        plan?.driverSignatures
          .filter((sig) => sig?.driver?.toString() === userObjectId?.toString())
          .map((sig) => sig?.driver),
      );

      console.log(isDriver, 'isDriver', isWriter, 'isWriter');

      if (
        isWriter.filter((writer) => writer !== undefined).length > 0 ||
        isDriver.filter((driver) => driver !== undefined).length > 0
      ) {
        throw new HttpException(
          '진행 중인 작업계획서의 작성자 혹은 운전자로 등록되어 있습니다.',
          HttpStatus.CONFLICT,
        );
      }

      // 중장비에 등록된 점검자, 확인자인지 확인
      const query: any = {
        $or: [{ inspectors: userObjectId }, { reviewers: userObjectId }],
      };

      const equipments = await this.equipmentRepository.findQuery(query);

      const ids = equipments.map((equipment) => equipment._id as string);

      const checkSheets = await this.checkSheetRepository.findAllLatest(ids);

      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();

      // ✅ 필터링
      const todayItems = checkSheets.filter((item) => {
        const createdAt = new Date(item.createdAt);

        const isToday =
          createdAt.getFullYear() === todayYear &&
          createdAt.getMonth() === todayMonth &&
          createdAt.getDate() === todayDate;
        console.log(createdAt, isToday);
        return isToday;
      });

      if (!todayItems) {
        const result = await this.usersRepository.remove(id);
        if (!result) {
          throw new HttpException(
            '사용자 업데이트에 실패했습니다.',
            HttpStatus.BAD_REQUEST,
          );
        }
        return result;
      }

      const isRole = todayItems.filter(
        (item) =>
          item.reviewer.toString() === userObjectId.toString() ||
          item.inspector.toString() === userObjectId.toString(),
      );

      if (isRole.length > 0) {
        throw new HttpException(
          '금일 점검표의 점검자 혹은 확인자로 등록되어 있습니다.',
          HttpStatus.CONFLICT,
        );
      }

      const oldRole = user.role;
      if (oldRole !== userInfo.role) {
        const roleFieldMap = {
          inspector: 'inspectors',
          reviewer: 'reviewers',
          driver: 'drivers',
        };
        const oldRoleField = roleFieldMap[oldRole];
        if (oldRoleField) {
          await this.equipmentRepository.oldRoleFieldUpdate(
            oldRoleField,
            userObjectId.toString(),
          );
        }
      }

      const result = await this.usersRepository.update(id, updateData as any);

      if (!result) {
        throw new HttpException(
          '사용자 업데이트에 실패했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }
      ErrorHelper.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      // Role 찾기
      const user = await this.usersRepository.findOne(id);
      const userObjectId = new mongoose.Types.ObjectId(id);

      // 모든 중장비 찾아서 id로 변경
      const findAllEquipment = await this.equipmentRepository.findAll();
      const equipmentIds = findAllEquipment.map((item) => item._id.toString());

      console.log(equipmentIds, 'equipments');

      // 진행중인 작업계획서에 해당하는 것 모두 찾기
      const workPlanData =
        await this.workPlanRepository.findAllTodayEntry(equipmentIds);

      // console.log(workPlanData, 'workPlanData');

      // 삭제하려는 유저가 진행 중인 작업 게획서의 작성자인지 확인
      const isWriter = workPlanData.filter(
        (item) =>
          item?.mutableData?.writer?.toString() === userObjectId?.toString(),
      );

      // 삭제하려는 유저가 진행 중인 작업 계획서의 운전자인지 확인
      const isDriver = workPlanData.flatMap((plan) =>
        plan?.driverSignatures
          .filter((sig) => sig?.driver?.toString() === userObjectId?.toString())
          .map((sig) => sig?.driver),
      );

      console.log(isDriver, 'isDriver', isWriter, 'isWriter');

      if (
        isWriter.filter((writer) => writer !== undefined).length > 0 ||
        isDriver.filter((driver) => driver !== undefined).length > 0
      ) {
        throw new HttpException(
          '진행 중인 작업계획서의 작성자 혹은 운전자로 등록되어 있습니다.',
          HttpStatus.CONFLICT,
        );
      }

      // 중장비에 등록된 점검자, 확인자인지 확인
      const query: any = {
        $or: [{ inspectors: userObjectId }, { reviewers: userObjectId }],
      };

      const equipments = await this.equipmentRepository.findQuery(query);

      const ids = equipments.map((equipment) => equipment._id as string);

      const checkSheets = await this.checkSheetRepository.findAllLatest(ids);

      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = now.getMonth();
      const todayDate = now.getDate();

      // ✅ 필터링
      const todayItems = checkSheets.filter((item) => {
        const createdAt = new Date(item.createdAt);

        const isToday =
          createdAt.getFullYear() === todayYear &&
          createdAt.getMonth() === todayMonth &&
          createdAt.getDate() === todayDate;
        console.log(createdAt, isToday);
        return isToday;
      });

      if (!todayItems) {
        const result = await this.usersRepository.remove(id);
        if (!result) {
          throw new HttpException(
            '사용자 업데이트에 실패했습니다.',
            HttpStatus.BAD_REQUEST,
          );
        }
        return result;
      }

      const isRole = todayItems.filter(
        (item) =>
          item.reviewer.toString() === userObjectId.toString() ||
          item.inspector.toString() === userObjectId.toString(),
      );

      if (isRole.length > 0) {
        throw new HttpException(
          '금일 점검표의 점검자 혹은 확인자로 등록되어 있습니다.',
          HttpStatus.CONFLICT,
        );
      }

      const result = await this.usersRepository.remove(id);
      if (!result) {
        throw new HttpException(
          '사용자 업데이트에 실패했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;

      // return equipments;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }
      ErrorHelper.handleError(error);
    }
  }
}
