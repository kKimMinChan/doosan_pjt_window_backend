import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FileInfo,
  FileStorage,
  FileStorageDocument,
} from './entities/file-storage.entity';
import { Model } from 'mongoose';

export interface FileStorageRepository {
  create(imageUrl: FileInfo);
  findAll();
}

@Injectable()
export class fileStorageMongoRepository implements FileStorageRepository {
  constructor(
    @InjectModel(FileStorage.name)
    private fileStorageModel: Model<FileStorageDocument>,
  ) {}

  async create(imageUrl: FileInfo) {
    const updatedDocument = await this.fileStorageModel.findOneAndUpdate(
      {},
      {
        $push: {
          files: {
            $each: [imageUrl], // 새로운 파일 추가
          },
        },
      },
      { upsert: true, new: true },
    );

    console.log(updatedDocument);

    return updatedDocument.files;
  }

  async findAll() {
    return (await this.fileStorageModel.findOne()).files;
  }
}
