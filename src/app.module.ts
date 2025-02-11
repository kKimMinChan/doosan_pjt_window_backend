import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckSheetModule } from './check-sheet/check-sheet.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { WorkPlanModule } from './work-plan/work-plan.module';
// import { DriversModule } from './drivers/drivers.module';
import { RecordModule } from './record/record.module';
import { CheckedSheetModule } from './checked-sheet/checked-sheet.module';
import { UserModule } from './admin/user/user.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { HeavyEquipmentModule } from './heavy-equipment/heavy-equipment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (ConfigService: ConfigService) => ({
        uri: ConfigService.get<string>('MONGO_URI'),
        // uri: ConfigService.get<string>('MONGODB_CHECK_SHEET_URL'),
      }),
      inject: [ConfigService],
    }),
    CheckSheetModule,
    // WorkPlanModule,
    RecordModule,
    CheckedSheetModule,
    UserModule,
    FileStorageModule,
    HeavyEquipmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
