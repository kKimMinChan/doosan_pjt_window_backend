import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  CreateHeavyEquipmentRequest,
  UpdateHeavyEquipmentRequest,
} from './dto/request';
import { UpdateHeavyEquipmentDto } from './dto/response';
import { HeavyEquipmentMongoRepository } from './heavy-equipment.repository';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import mongoose from 'mongoose';
import { usersMongoRepository } from 'src/admin/user/user.repository';

@Injectable()
export class HeavyEquipmentService {
  constructor(
    private heavyEquipmentRepository: HeavyEquipmentMongoRepository,
    private usersRepository: usersMongoRepository,
  ) {}

  async create(createHeavyEquipmentDto: CreateHeavyEquipmentRequest) {
    return await this.heavyEquipmentRepository.createHeavyEquipment(
      createHeavyEquipmentDto,
    );
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, page } = paginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.heavyEquipmentRepository.findAll(skip, limit),
        this.heavyEquipmentRepository.countEquipments(),
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
      return await this.heavyEquipmentRepository.findOne(id);
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
    updateHeavyEquipmentDto: UpdateHeavyEquipmentRequest,
  ) {
    try {
      const mergedArray = [
        updateHeavyEquipmentDto.inspectors,
        updateHeavyEquipmentDto.reviewers,
      ].flat();
      const missingUsers =
        await this.usersRepository.findMissingUsers(mergedArray);
      if (missingUsers.length > 0) {
        throw new HttpException(
          `존재하지 않는 ID: ${missingUsers}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.heavyEquipmentRepository.update(
        id,
        updateHeavyEquipmentDto,
      );
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async remove(id: string) {
    return await this.heavyEquipmentRepository.remove(id);
  }
}
