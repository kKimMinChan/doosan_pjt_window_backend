import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { SignatureType } from '../entities/work-plan.schema';

class WorkPlanData {
  @ApiProperty({
    description: '작성자',
    example: '홍길동',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  writer: string;

  @ApiProperty({
    description: '제목',
    example: '작업 계획서',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '부서',
    example: '기획부',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({
    description: '작업 지휘자',
    example: '김철수',
    required: true,
  })
  @IsString()
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
    description: '작업 방법',
    example: ['방법1', '방법2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  methods: string[];

  @ApiProperty({
    description: '이동경로 위험사항',
    example: ['위험사항1', '위험사항2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  movingPathHazards: string[];

  @ApiProperty({
    description: '하역운반 작업 위험사항',
    example: ['위험사항1', '위험사항2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  loadingUnloadingHazards: string[];

  @ApiProperty({
    description: '전도위험방지',
    example: ['방지1', '방지2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  tipOverPrevention: string[];

  @ApiProperty({
    description: '낙하위험방지',
    example: ['방지1', '방지2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  fallPrevention: string[];

  @ApiProperty({
    description: '접촉충돌 위험방지',
    example: ['방지1', '방지2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  contactCollisionPrevention: string[];

  @ApiProperty({
    description: '협착위험방지',
    example: ['방지1', '방지2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  crushPrevention: string[];

  @ApiProperty({
    description: '붕괴위험방지',
    example: ['방지1', '방지2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  collapsePrevention: string[];

  @ApiProperty({
    description: '추락위험방비',
    example: ['방지1', '방지2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  fallHazardPrevention: string[];

  @ApiProperty({
    description: '안전점검',
    example: ['점검1', '점검2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  safetyInspection: string[];

  @ApiProperty({
    description: '안전수칙',
    example: ['수칙1', '수칙2'],
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  safetyRegulations: string[];
}

export class WorkPlanRequest {
  @ApiProperty({
    description: '작업 계획서 데이터',
    required: true,
    type: WorkPlanData,
  })
  @IsNotEmpty()
  data: WorkPlanData;

  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  @IsString()
  @IsOptional()
  equipment: string;
}

export class WorkPlanDetailsRequest extends PartialType(WorkPlanRequest) {}

export class AdminSignatureRequest {
  @ApiProperty({
    description: '서명 파일',
    format: 'binary',
    required: true,
  })
  file: string;

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
