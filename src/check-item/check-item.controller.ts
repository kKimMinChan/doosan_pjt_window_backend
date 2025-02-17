import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { CheckItemService } from './check-item.service';
import {
  CheckItemRequest,
  UpdateCheckItemRequest,
} from './dto/check-item-request.dto';
import { UpdateCheckItemDto } from './dto/check-item-response.dto';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('점검 항목')
@Controller('check-item')
export class CheckItemController {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Post()
  @ApiBody({ type: [CheckItemRequest] })
  create(@Body() checkItemDto: CheckItemRequest[]) {
    return this.checkItemService.create(checkItemDto);
  }

  @Post('/bulk')
  createBulk(@Body() checkItemDto: CheckItemRequest[]) {
    return this.checkItemService.create(checkItemDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.checkItemService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkItemService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCheckItemDto: UpdateCheckItemRequest,
  ) {
    return this.checkItemService.update(id, updateCheckItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkItemService.remove(id);
  }
}
