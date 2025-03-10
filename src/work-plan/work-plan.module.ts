import { Module } from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanController } from './work-plan.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkPlan, WorkPlanSchema } from './entities/work-plan.schema';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkPlanMongoRepository } from './work-plan.repository';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { UserModule } from 'src/admin/user/user.module';
import { HeavyEquipmentModule } from 'src/heavy-equipment/heavy-equipment.module';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';
import { multerOptionsFactory } from 'src/config/multer.s3';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkPlan.name, schema: WorkPlanSchema },
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        multerOptionsFactory(configService),
    }),
    UserModule,
    HeavyEquipmentModule,
  ],

  controllers: [WorkPlanController],
  providers: [
    WorkPlanService,
    WorkPlanMongoRepository,
    usersMongoRepository,
    HeavyEquipmentMongoRepository,
  ],
  exports: [MongooseModule],
})
export class WorkPlanModule {}
