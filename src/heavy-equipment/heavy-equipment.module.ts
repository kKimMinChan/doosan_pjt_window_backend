import { Module } from '@nestjs/common';
import { HeavyEquipmentService } from './heavy-equipment.service';
import { HeavyEquipmentController } from './heavy-equipment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HeavyEquipment,
  HeavyEquipmentSchema,
} from './entities/heavy-equipment.entity';
import { HeavyEquipmentMongoRepository } from './heavy-equipment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HeavyEquipment.name, schema: HeavyEquipmentSchema },
    ]),
  ],
  controllers: [HeavyEquipmentController],
  providers: [HeavyEquipmentService, HeavyEquipmentMongoRepository],
})
export class HeavyEquipmentModule {}
