import { Injectable, NotFoundException } from '@nestjs/common';
import { CheckSheetRequest } from './dto/check-sheet.request';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { CheckItemMongoRepository } from 'src/check-item/check-item.repository';
import { CheckSheet } from './entities/check-sheet.schema';

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

  async findAll() {
    return `This action returns all checkSheet`;
  }

  async findOne(id: string) {
    return await this.checkSheetRepository.findOne(id);
  }

  async update(id: string, updateCheckSheetDto: CheckSheetRequest) {
    return `This action updates a #${id} checkSheet`;
  }

  async remove(id: string) {
    return `This action removes a #${id} checkSheet`;
  }
}
