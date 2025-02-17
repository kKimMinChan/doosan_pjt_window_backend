import { Injectable } from '@nestjs/common';
import { UpdateCheckItemDto } from './dto/check-item-response.dto';
import {
  CheckItemRequest,
  UpdateCheckItemRequest,
} from './dto/check-item-request.dto';
import { CheckItemMongoRepository } from './check-item.repository';
import { PaginationDto } from 'src/common-dto/pagination.dto';

@Injectable()
export class CheckItemService {
  constructor(private checkItemRepository: CheckItemMongoRepository) {}

  async create(checkItemDto: CheckItemRequest[]) {
    return await this.checkItemRepository.create(checkItemDto);
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, page } = paginationDto;
      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.checkItemRepository.findAll(skip, limit),
        this.checkItemRepository.countCheckItems(),
      ]);

      return {
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        page,
        data,
      };
    } catch (error) {}
  }

  async findOne(id: string) {
    return await this.checkItemRepository.findOne(id);
  }

  async update(id: string, updateCheckItemDto: UpdateCheckItemRequest) {
    return await this.checkItemRepository.update(id, updateCheckItemDto);
  }

  async remove(id: string) {
    return await this.checkItemRepository.remove(id);
  }
}
