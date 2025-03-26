import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfo, UsersSchema } from './entities/user.entity';
import { usersMongoRepository } from './user.repository';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'src/config/multer.s3';
import { CheckSheetMongoRepository } from 'src/check-sheet/check-sheet.repository';
import { WorkPlanMongoRepository } from 'src/work-plan/work-plan.repository';
import { CheckSheetModule } from 'src/check-sheet/check-sheet.module';
import { WorkPlanModule } from 'src/work-plan/work-plan.module';
import { CheckItemModule } from 'src/check-item/check-item.module';
import { HeavyEquipmentModule } from 'src/heavy-equipment/heavy-equipment.module';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserInfo.name, schema: UsersSchema }]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        multerOptionsFactory(configService),
    }),
    CheckItemModule,
    // CheckSheetModule,
    forwardRef(() => CheckSheetModule),
    HeavyEquipmentModule,
    // forwardRef(() => WorkPlanModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    usersMongoRepository,
    CheckSheetMongoRepository,
    HeavyEquipmentMongoRepository,
    // WorkPlanMongoRepository,
  ],
  exports: [MongooseModule],
})
export class UserModule {}
