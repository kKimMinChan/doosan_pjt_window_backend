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
  remove(id: string);
  removeAll();
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

  async remove(id: string) {
    const removeDocument = await this.fileStorageModel
      .findOneAndUpdate(
        { 'files._id': id },
        { $pull: { files: { _id: id } } },
        { new: true },
      )
      .lean()
      .then((result) => result?.files);

    if (!removeDocument) {
      throw new Error('file not found');
    }

    return removeDocument;
  }

  async removeAll() {
    const removeDocument = await this.fileStorageModel.updateMany(
      {}, // 조건: 모든 문서
      { $unset: { files: '' } }, // `checkedLists` 필드를 제거
    );
    if (!removeDocument.acknowledged) {
      throw new Error(
        'repository Error:  checkedLists 전체 삭제 과정에서 에러 발생',
      );
    }
    return '파일 전체 삭제 완료';
  }
}
