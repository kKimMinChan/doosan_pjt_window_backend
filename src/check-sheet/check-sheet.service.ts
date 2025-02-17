import { Injectable, NotFoundException } from '@nestjs/common';
import { CheckSheetRequest } from './dto/check-sheet.request';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { CheckItemMongoRepository } from 'src/check-item/check-item.repository';
import { CheckSheet } from './entities/check-sheet.schema';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { ErrorHelper } from 'src/helper/ErrorHelper';

@Injectable()
export class CheckSheetService {
  constructor(
    private checkSheetRepository: CheckSheetMongoRepository,
    private checkItemRepository: CheckItemMongoRepository,
  ) {}
  async create(checkSheetDto: CheckSheetRequest) {
    const checkItems = checkSheetDto.items.map((item) => item.checkItem);

    const checkItemIds = await this.checkItemRepository.create(checkItems);

    const items = checkItemIds.map((id, index) => ({
      checkItem: String(id),
      isOk: checkSheetDto.items[index].isOk,
    }));

    const newCheckSheet = {
      ...checkSheetDto,
      items,
    };

    return await this.checkSheetRepository.create(newCheckSheet);
  }

  async findAll(id: string, paginationDto: PaginationDto) {
    try {
      const { limit, page } = paginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.checkSheetRepository.findAll(id, skip, limit),
        this.checkSheetRepository.countCheckSheet(id),
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
    return await this.checkSheetRepository.findOne(id);
  }

  async findOneLatest(id: string) {
    return await this.checkSheetRepository.findOneLatest(id);
  }

  async update(id: string, updateCheckSheetDto: CheckSheetRequest) {
    return `This action updates a #${id} checkSheet`;
  }

  async remove(id: string) {
    return `This action removes a #${id} checkSheet`;
  }
}
