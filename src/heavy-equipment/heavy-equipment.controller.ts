import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { HeavyEquipmentService } from './heavy-equipment.service';
import {
  CreateHeavyEquipmentRequest,
  UpdateHeavyEquipmentRequest,
} from './dto/request';
import {
  HeavyEquipmentResponse,
  UpdateHeavyEquipmentDto,
} from './dto/response';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';

@Controller('heavy-equipment')
export class HeavyEquipmentController {
  constructor(private readonly heavyEquipmentService: HeavyEquipmentService) {}

  @Post()
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  create(@Body() createHeavyEquipmentDto: CreateHeavyEquipmentRequest) {
    this.heavyEquipmentService.create(createHeavyEquipmentDto);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Get()
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(HeavyEquipmentResponse, '', true),
  )
  @ApiResponse({ type: HeavyEquipmentResponse })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.heavyEquipmentService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(HeavyEquipmentResponse),
  )
  async findOne(@Param('id') id: string) {
    const heavyEquipment = await this.heavyEquipmentService.findOne(id);
    return { data: [heavyEquipment] };
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateHeavyEquipmentDto: UpdateHeavyEquipmentRequest,
  ) {
    console.log(updateHeavyEquipmentDto, 'dto');
    this.heavyEquipmentService.update(id, updateHeavyEquipmentDto);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.heavyEquipmentService.remove(id);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }
}
