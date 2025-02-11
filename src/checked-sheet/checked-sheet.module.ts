import { Module } from '@nestjs/common';
import { CheckedSheetService } from './checked-sheet.service';
import { CheckedSheetController } from './checked-sheet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CheckedSheet,
  CheckedSheetSchema,
} from './entities/checked-sheet.schema';
import { CheckedSheetMongoRepository } from './checked-sheet.repository';
import {
  CheckSheet,
  CheckSheetSchema,
} from 'src/check-sheet/check-sheet.schema';
import { UserInfo, UsersSchema } from 'src/admin/user/entities/user.entity';
import { CheckSheetMongoRepository } from 'src/check-sheet/check-sheet.repository';
import { usersMongoRepository } from 'src/admin/user/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckedSheet.name, schema: CheckedSheetSchema },
      { name: CheckSheet.name, schema: CheckSheetSchema },
      { name: UserInfo.name, schema: UsersSchema },
    ]),
  ],
  controllers: [CheckedSheetController],
  providers: [
    CheckedSheetService,
    CheckedSheetMongoRepository,
    CheckSheetMongoRepository,
    usersMongoRepository,
  ],
})
export class CheckedSheetModule {}
