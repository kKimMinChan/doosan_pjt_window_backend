import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckSheetModule } from './check_sheet/check_sheet.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WorkPlanModule } from './work-plan/work-plan.module';
import { DriversModule } from './drivers/drivers.module';
import { Esp32Module } from './esp32/esp32.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (ConfigService: ConfigService) => ({
        uri: ConfigService.get<string>('MONGODB_CHECK_SHEET_URL'),
      }),
      inject: [ConfigService],
    }),
    CheckSheetModule,
    WorkPlanModule,
    DriversModule,
    Esp32Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
