import { ApiProperty } from '@nestjs/swagger';

export class FileRequest {
  @ApiProperty({
    description: '업로드할 파일',
    type: 'string',
    format: 'binary',
    required: false,
  })
  file?: any; // 파일 필드 추가
}

export class FilesRequest {
  @ApiProperty({
    description: '운전자 이미지',
    format: 'binary',
    required: true,
  })
  files: Express.Multer.File[];
}
