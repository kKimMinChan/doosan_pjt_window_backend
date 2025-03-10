import { Module } from '@nestjs/common';
import { SystemStatusService } from './system-status.service';
import { SystemStatusController } from './system-status.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SystemStatus,
  SystemStatusSchema,
} from './entities/system-status.schema';
import { CheckSheetMongoRepository } from 'src/check-sheet/check-sheet.repository';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';
import { UserModule } from 'src/admin/user/user.module';
import { HeavyEquipmentModule } from 'src/heavy-equipment/heavy-equipment.module';
import { CheckSheetModule } from 'src/check-sheet/check-sheet.module';
import { CheckItemModule } from 'src/check-item/check-item.module';
import { WorkPlanModule } from 'src/work-plan/work-plan.module';
import { WorkPlanMongoRepository } from 'src/work-plan/work-plan.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SystemStatus.name, schema: SystemStatusSchema },
    ]),
    UserModule,
    CheckSheetModule,
    CheckItemModule,
    WorkPlanModule,
  ],
  controllers: [SystemStatusController],
  providers: [
    SystemStatusService,
    CheckSheetMongoRepository,
    usersMongoRepository,
    WorkPlanMongoRepository,
  ],
})
export class SystemStatusModule {}
