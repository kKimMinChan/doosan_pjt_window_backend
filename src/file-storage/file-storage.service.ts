import { Injectable } from '@nestjs/common';
import { fileStorageMongoRepository } from './file-storage.repository';
import { FileInfoResponse } from './dto/response.dto';

@Injectable()
export class FileStorageService {
  constructor(private fileStorageRepository: fileStorageMongoRepository) {}
  async create(file: Express.Multer.File) {
    const imageUrl = file.path;

    const createDocument = await this.fileStorageRepository.create({
      imageUrl,
    });

    return createDocument;
  }

  async findAll() {
    return await this.fileStorageRepository.findAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} fileStorage`;
  }

  // update(id: number, updateFileStorageDto: UpdateFileStorageDto) {
  //   return `This action updates a #${id} fileStorage`;
  // }

  remove(id: number) {
    return `This action removes a #${id} fileStorage`;
  }
}
