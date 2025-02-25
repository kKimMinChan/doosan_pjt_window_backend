import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { WorkPlanModule } from './work-plan/work-plan.module';
// import { DriversModule } from './drivers/drivers.module';
import { RecordModule } from './record/record.module';
import { UserModule } from './admin/user/user.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { HeavyEquipmentModule } from './heavy-equipment/heavy-equipment.module';
import { CheckItemModule } from './check-item/check-item.module';
import { CheckSheetModule } from './check-sheet/check-sheet.module';
import { WorkPlanModule } from './work-plan/work-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (ConfigService: ConfigService) => ({
        // uri: process.env.MONGO_URI,
        uri: ConfigService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    RecordModule,
    UserModule,
    FileStorageModule,
    HeavyEquipmentModule,
    CheckItemModule,
    CheckSheetModule,
    WorkPlanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
