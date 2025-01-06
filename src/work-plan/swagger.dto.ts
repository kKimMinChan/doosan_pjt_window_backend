import { ApiProperty } from '@nestjs/swagger';

export class InputImageFileDto {
  @ApiProperty({
    description: 'formData.append("workPlanFile", file)',
    type: 'string',
    format: 'binary',
    required: true,
  })
  workPlanFile: File;
}
export class InputSignatureDto {
  @ApiProperty({
    description: 'formData.append("file", file) 서명 이미지',
    type: 'string',
    format: 'binary',
    required: true,
  })
  file: File;

  @ApiProperty({
    description: '[draft, authorization, approval, driver] type은 이중 하나',
    example: 'draft',
    required: true,
    enum: ['draft', 'authorization', 'approval', 'driver'],
  })
  type: string;

  @ApiProperty({
    description: '타입이 운전자면 운전자 이름',
    example: '김민찬',
    required: false,
  })
  name: string;
}

export class InputUpdateDriverImagesDto {
  @ApiProperty({
    description: '현재 사용중인 작업 계획서 image_url',
    example: 'uploads/김민찬.png',
    required: true,
  })
  originWorkPlanPath: string;
}

export class ImageDto {
  @ApiProperty({
    description: 'Base64로 인코딩된 이미지 데이터',
    example: 'data:image/png;base64,...',
    required: false,
  })
  base64?: string;

  @ApiProperty({
    description: '이미지 URL',
    example: 'http://example.com/image.png',
    required: false,
  })
  image_url?: string;
}
export class DriverSignatureDto {
  @ApiProperty({
    description: '운전자 이름',
    example: '홍길동',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: '운전자 서명 이미지',
    type: ImageDto,
    required: false,
  })
  signatureImage?: ImageDto;
}

export class SignatureDto {
  @ApiProperty({
    description: '기안 서명 이미지',
    type: ImageDto,
    required: false,
  })
  draft?: ImageDto;

  @ApiProperty({
    description: '승인 서명 이미지',
    type: ImageDto,
    required: false,
  })
  authorization?: ImageDto;

  @ApiProperty({
    description: '결재 서명 이미지',
    type: ImageDto,
    required: false,
  })
  approval?: ImageDto;

  @ApiProperty({
    description: '운전자 서명 목록',
    type: [DriverSignatureDto],
    required: false,
  })
  driver?: DriverSignatureDto[];
}

export class WorkPlanItemDto {
  @ApiProperty({
    description: '작업 계획 이미지',
    type: ImageDto,
    required: true,
  })
  workPlanImage: ImageDto;

  @ApiProperty({
    description: '서명 데이터',
    type: SignatureDto, // SignatureDto 참조
    required: false,
  })
  signature?: SignatureDto;

  @ApiProperty({
    description: '작업 계획 생성일',
    example: '2024-12-16T12:00:00.000Z',
    required: false,
  })
  createdAt?: Date;
}

export class WorkPlanDto {
  @ApiProperty({
    description: '작업 계획 목록',
    type: WorkPlanItemDto, // 배열로 정의
    required: true,
  })
  workPlanList: WorkPlanItemDto;
}
