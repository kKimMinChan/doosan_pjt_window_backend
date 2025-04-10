import { Module } from '@nestjs/common';
import { RasPiService } from './ras-pi.service';
import { RasPiController } from './ras-pi.controller';

@Module({
  controllers: [RasPiController],
  providers: [RasPiService],
})
export class RasPiModule {}
