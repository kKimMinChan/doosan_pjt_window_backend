// import { PartialType } from '@nestjs/swagger';
// import { CreateFileStorageDto } from './create-file-storage.dto';

// export class UpdateFileStorageDto extends PartialType(CreateFileStorageDto) {}

export class FileInfoResponse {
  imageUrl: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
