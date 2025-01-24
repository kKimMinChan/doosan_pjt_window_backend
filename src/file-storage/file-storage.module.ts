import { Module } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { FileStorageController } from './file-storage.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FileStorage, FileStorageSchema } from './entities/file-storage.entity';
import { fileStorageMongoRepository } from './file-storage.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileStorage.name, schema: FileStorageSchema },
    ]),
  ],
  controllers: [FileStorageController],
  providers: [FileStorageService, fileStorageMongoRepository],
})
export class FileStorageModule {}
