import { Module } from '@nestjs/common';
import { Esp32Controller } from './esp32.controller';
import { Esp32Service } from './esp32.service';
import { Esp32Gateway } from './esp32.gateway';

@Module({
  controllers: [Esp32Controller],
  providers: [Esp32Service, Esp32Gateway],
})
export class Esp32Module {}
