import { Module } from '@nestjs/common';
import { CheckedSheetService } from './checked-sheet.service';
import { CheckedSheetController } from './checked-sheet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CheckedSheet,
  CheckedSheetSchema,
} from './entities/checked-sheet.schema';
import { CheckedSheetMongoRepository } from './checked-sheet.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckedSheet.name, schema: CheckedSheetSchema },
    ]),
  ],
  controllers: [CheckedSheetController],
  providers: [CheckedSheetService, CheckedSheetMongoRepository],
})
export class CheckedSheetModule {}
