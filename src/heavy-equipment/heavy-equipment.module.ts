import { Module } from '@nestjs/common';
import { HeavyEquipmentService } from './heavy-equipment.service';
import { HeavyEquipmentController } from './heavy-equipment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HeavyEquipment,
  HeavyEquipmentSchema,
} from './entities/heavy-equipment.entity';
import { HeavyEquipmentMongoRepository } from './heavy-equipment.repository';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { UserModule } from 'src/admin/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HeavyEquipment.name, schema: HeavyEquipmentSchema },
    ]),
    UserModule,
  ],
  controllers: [HeavyEquipmentController],
  providers: [
    HeavyEquipmentService,
    HeavyEquipmentMongoRepository,
    usersMongoRepository,
  ],
})
export class HeavyEquipmentModule {}
