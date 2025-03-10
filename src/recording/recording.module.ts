import { Module } from '@nestjs/common';
import { RecordingService } from './recording.service';
import { RecordingController } from './recording.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Recording, RecordingSchema } from './entities/recording.schema';
import { RecordingMongoRepository } from './recording.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recording.name, schema: RecordingSchema },
    ]),
  ],
  controllers: [RecordingController],
  providers: [RecordingService, RecordingMongoRepository],
})
export class RecordingModule {}
