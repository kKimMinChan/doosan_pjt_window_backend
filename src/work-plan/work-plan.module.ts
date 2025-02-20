import { Module } from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanController } from './work-plan.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkPlan, WorkPlanSchema } from './entities/work-plan.schema';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'multer.s3';
import { WorkPlanMongoRepository } from './work-plan.repository';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { UserModule } from 'src/admin/user/user.module';

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
  ],

  controllers: [WorkPlanController],
  providers: [WorkPlanService, WorkPlanMongoRepository, usersMongoRepository],
})
export class WorkPlanModule {}
