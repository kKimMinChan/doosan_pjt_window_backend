import { Module } from '@nestjs/common';
import { CheckSheetController } from './check-sheet.controller';
import { CheckSheetService } from './check-sheet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckSheetInfo, CheckSheetInfoSchema } from './check-sheet.schema';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { PassportModule } from '@nestjs/passport';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';
import {
  HeavyEquipment,
  HeavyEquipmentSchema,
} from 'src/heavy-equipment/entities/heavy-equipment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckSheetInfo.name, schema: CheckSheetInfoSchema },
      { name: HeavyEquipment.name, schema: HeavyEquipmentSchema },
    ]),
    PassportModule.register({ session: true }),
  ],
  controllers: [CheckSheetController],
  providers: [
    CheckSheetService,
    CheckSheetMongoRepository,
    HeavyEquipmentMongoRepository,
  ],
})
export class CheckSheetModule {}
