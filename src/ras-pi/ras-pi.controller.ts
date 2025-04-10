import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RasPiService } from './ras-pi.service';
import { shutdownResponse } from './dto/update-ras-pi.dto';
import { RasPiDto, WifiChangeDto } from './dto/create-ras-pi.dto';
import { ApiCreatedResponse, ApiParam } from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import { ErrorHelper } from 'src/helper/ErrorHelper';

@Controller('ras-pi')
export class RasPiController {
  constructor(private readonly rasPiService: RasPiService) {}

  @Post('wifi-change')
  async create(@Body() wifiChangeDto: WifiChangeDto) {
    try {
      const result = await this.rasPiService.wifiChange(wifiChangeDto);
      return {
        translate: result,
      };
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  @Post('shutdown')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(shutdownResponse, '', false, true),
  )
  async shutdown(@Body() rasPiDto: RasPiDto) {
    try {
      const result = await this.rasPiService.shutdown(rasPiDto);
      return {
        translate: result,
      };
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  @Post('scan-wifi-networks')
  async scanWifiNetworks(@Body() rasPiDto: RasPiDto) {
    try {
      return { data: await this.rasPiService.scanWifiNetworks(rasPiDto) };
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rasPiService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRasPiDto: UpdateRasPiDto) {
  //   return this.rasPiService.update(+id, updateRasPiDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rasPiService.remove(+id);
  }
}
