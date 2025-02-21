import { ApiProperty } from '@nestjs/swagger';
import { SignatureType } from '../entities/work-plan.schema';

export class AdminSignatureResponse {
  @ApiProperty({
    description: '이미지 주소',
    required: false,
  })
  url: string;

  @ApiProperty({
    description: '서명 유형 (create, approval, finish)',
    enum: ['create', 'approval', 'finish'],
    example: 'create',
    required: false,
  })
  type: SignatureType;
}

export class DriverSignatureResponse {
  @ApiProperty({
    description: '이미지 주소',
    required: false,
  })
  url: string;

  @ApiProperty({
    description: '운전자 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: true,
  })
  driver: string;
}

export class WorkPlanResponse {
  @ApiProperty({
    description: '관리자 서명',
    required: false,
    type: AdminSignatureResponse,
    isArray: true,
  })
  adminSignatures: [AdminSignatureResponse];

  @ApiProperty({
    description: '운전자 서명',
    required: false,
    type: DriverSignatureResponse,
    isArray: true,
  })
  driverSignatures: [DriverSignatureResponse];

  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  heavyEquipment: string;

  @ApiProperty({
    description: '생성일',
    example: '2025-02-05T05:50:04.116Z',
    required: false,
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-02-05T05:50:04.116Z',
    required: false,
  })
  updatedAt: Date;

  @ApiProperty({ example: '67a2fc0c89ca50f1cee44e03' })
  id: string;
}

export class WorkPlanRequest {
  @ApiProperty({
    description: '작업 계획서 이미지 파일',
    format: 'binary',
    required: true,
  })
  file: string;

  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  heavyEquipment: string;
}

export class AssignEquipmentResponse {
  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  heavyEquipment: string;
}
