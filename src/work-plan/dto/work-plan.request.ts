import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { SignatureType } from '../entities/work-plan.schema';

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
  @IsString()
  @IsOptional()
  heavyEquipment: string;
}

export class AssignEquipmentRequest {
  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  @IsString()
  heavyEquipment: string;
}

export class AdminSignatureRequest {
  @ApiProperty({
    description: '서명 파일',
    format: 'binary',
    required: true,
  })
  file: string;

  @ApiProperty({
    description: '서명 유형 (create, approval, finish)',
    enum: ['create', 'approval', 'finish'],
    example: 'create',
    required: true,
  })
  @IsEnum(SignatureType, {
    message: 'type 값은 create, approval, finish 중 하나여야 합니다.',
  })
  type: SignatureType;
}

export class DriverSignatureRequest {
  @ApiProperty({
    description: '서명 파일',
    format: 'binary',
    required: true,
  })
  file: string;

  @ApiProperty({
    description: '운전자 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: true,
  })
  @IsString()
  driver: string;
}
