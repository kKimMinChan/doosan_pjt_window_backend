import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class DriversImageDto {
  @ApiProperty({
    description: '운전자 이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Base64로 인코딩된 이미지 데이터',
    example: 'data:image/png;base64,...',
    required: false,
  })
  @IsString()
  base64?: string;

  @ApiProperty({
    description: '이미지 URL',
    example: 'http://example.com/image.png',
    required: false,
  })
  @IsString()
  image_url?: string;
}

export class DriversDto {
  @ApiProperty({
    description: '운전자 이미지 목록',
    type: [DriversImageDto],
  })
  driversImage: DriversImageDto[];
}

export class ImageInputDto {
  @ApiProperty({
    description: '이미지 URL',
    example: 'uploads/김민찬.png',
    required: false,
  })
  @IsString()
  image_url?: string;
}

export class DriverImagesOutput {
  @ApiProperty({
    description: 'image url',
  })
  @IsString()
  image_url: string;

  @ApiProperty({
    description: '파일 확장자 제외한 이름',
  })
  @IsString()
  name: string;
}

export class DriverImagesOutputDto {
  @ApiProperty({
    type: [DriverImagesOutput],
    example: [
      {
        image_url: 'uploads/2차 전공상담 신청 결과.png',
        name: '2차 전공상담 신청 결과',
      },
      {
        image_url: 'uploads/생성.png',
        name: '생성',
      },
    ],
  })
  driversImage: DriverImagesOutput[];
}

export class CreateDriverImageInputDto {
  @ApiProperty({
    description: '운전자 이미지',
    format: 'binary',
    required: true,
  })
  files: Express.Multer.File[];
}

export class UpdateDriverImageInputDto {
  @ApiProperty({
    description: '운전자 이미지 파일 배열',
    type: 'string',
    format: 'binary', // 파일 업로드를 지원
    required: false,
    isArray: true, // 여러 파일 업로드 가능
  })
  @IsOptional()
  files?: Express.Multer.File[];

  @ApiProperty({
    description: '운전자 이미지 경로 배열',
    type: [ImageInputDto],
    example: [
      { image_url: 'uploads/김민찬.png' },
      { image_url: 'uploads/김철환.png' },
      { image_url: 'uploads/안성문.png' },
    ],
    required: false,
  })
  @IsOptional()
  originDriverPaths?: ImageInputDto[];
}
