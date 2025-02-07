import { Injectable } from '@nestjs/common';
import { fileStorageMongoRepository } from './file-storage.repository';
import { FileInfoResponse } from './dto/response.dto';

@Injectable()
export class FileStorageService {
  constructor(private fileStorageRepository: fileStorageMongoRepository) {}
  // async create(file: Express.Multer.File) {
  //   const imageUrl = file.path;

  //   const createDocument = await this.fileStorageRepository.create({
  //     imageUrl,
  //   });

  //   return createDocument;
  // }
  async create(files: Express.Multer.File[]) {
    const imageUrls = files.map((file, _) => file.path);

    console.log(imageUrls, 'urls');

    const createDocument = await this.fileStorageRepository.create(imageUrls);

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

  async remove(id: string) {
    return await this.fileStorageRepository.remove(id);
  }

  async removeAll() {
    return await this.fileStorageRepository.removeAll();
  }
}
