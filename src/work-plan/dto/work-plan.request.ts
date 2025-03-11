import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SignatureType } from '../entities/work-plan.schema';
import mongoose from 'mongoose';

class MutableData {
  @ApiProperty({
    description: '작성자 id',
    example: '67ac4cc798a6e79ea2369d39',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  writer: mongoose.Types.ObjectId;

  @ApiProperty({
    description: '제목',
    example: '작업 계획서',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '부서',
    example: '기획부',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: '작업 지휘자',
    example: '김철수',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  leader: string;

  @ApiProperty({
    description: '작업 내용',
    example: '작업 내용입니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  specifications: string;

  @ApiProperty({
    description: '중량물 제반 사항',
    example: '3ton 미만',
    required: false,
  })
  @IsString()
  @IsOptional()
  itemDetail: string;

  @ApiProperty({
    description: '이동 경로',
    example: '경로입니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  route: string;

  @ApiProperty({
    description: '작업 일시(시작)',
    example: '2025-03-10',
    required: false,
  })
  @IsString()
  @IsOptional()
  startDay: string;

  @ApiProperty({
    description: '작업 일시(끝)',
    example: '2025-03-16',
    required: false,
  })
  @IsString()
  @IsOptional()
  endDay: string;
}

export class DriverSignatureRequest {
  @ApiProperty({
    description: '서명 파일',
    format: 'binary',
    required: true,
  })
  dark: string;

  @ApiProperty({
    description: '서명 파일',
    format: 'binary',
    required: true,
  })
  white: string;

  @ApiProperty({
    description: '운전자 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: true,
  })
  @IsString()
  driver: string;
}

class Register {
  @ApiProperty({
    description: '운전자 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  @IsString()
  @IsOptional()
  driver: mongoose.Types.ObjectId;

  @ApiProperty({
    description: 'url',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;
}

export class WorkPlanRequest {
  @ApiProperty({
    description: '작업 계획서 데이터',
    required: false,
    type: MutableData,
  })
  @IsNotEmpty()
  @IsOptional()
  mutableData: MutableData;

  @ApiProperty({
    description: '고정 데이터',
    example: '고정 데이터입니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  fixedData: string;

  @ApiProperty({
    description: '중장비 id',
    example: ['67ad5a268f3d88a7ce6657d7'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  equipment: string[];

  @ApiProperty({
    description: '운전자 명단',
    required: false,
    type: [Register],
  })
  @IsArray()
  @IsOptional()
  driverSignatures: Register[];
}

export class WorkPlanDetailsRequest {
  @ApiProperty({
    description: '작업 계획서 데이터',
    required: false,
    type: MutableData,
  })
  @IsNotEmpty()
  @IsOptional()
  mutableData: MutableData;

  @ApiProperty({
    description: '고정 데이터',
    example: '고정 데이터입니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  fixedData: string;

  @ApiProperty({
    description: '중장비 id',
    example: ['67ad5a268f3d88a7ce6657d7'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  equipment: string[];

  @ApiProperty({
    description: '운전자 명단',
    required: false,
    type: [Register],
  })
  @IsArray()
  @IsOptional()
  driverSignatures: Register[];
}

export class AdminSignatureRequest {
  @ApiProperty({
    description: '서명 파일',
    format: 'binary',
    required: true,
  })
  dark: string;

  @ApiProperty({
    description: '서명 파일',
    format: 'binary',
    required: true,
  })
  white: string;

  @ApiProperty({
    description: '서명 유형 (create, finish)',
    enum: ['create', 'finish'],
    example: 'create',
    required: true,
  })
  @IsEnum(SignatureType, {
    message: 'type 값은 create, finish 중 하나여야 합니다.',
  })
  type: SignatureType;
}
