import { Module } from '@nestjs/common';
import { CheckedListsService } from './checked-lists.service';
import { CheckedListsController } from './checked-lists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CheckedLists,
  CheckedListsSchema,
} from './entities/checked-list.schema';
import { CheckedListsMongoRepository } from './checked-lists.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckedLists.name, schema: CheckedListsSchema },
    ]),
  ],
  controllers: [CheckedListsController],
  providers: [CheckedListsService, CheckedListsMongoRepository],
})
export class CheckedListsModule {}
