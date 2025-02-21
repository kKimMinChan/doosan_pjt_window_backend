import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UserRequest {
  @ApiProperty({
    description: '운전자 이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '부서',
    example: '안전',
    required: false,
  })
  @IsString()
  department: string;

  @ApiProperty({
    description: '역할',
    example: 'DRIVER',
    enum: ['DRIVER', 'INSPECTOR', 'REVIEWER', 'ADMIN'],
    required: false,
  })
  @IsIn(['DRIVER', 'INSPECTOR', 'REVIEWER', 'ADMIN'])
  role: string;

  @ApiProperty({
    description: '업로드할 파일',
    type: 'string',
    format: 'binary',
    required: false,
  })
  file?: Express.MulterS3.File; // 파일 필드 추가
}

export class UpdateUserRequest {
  @ApiProperty({
    description: '운전자 이름',
    example: '홍길동',
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    description: '부서',
    example: '안전',
    required: false,
  })
  @IsString()
  @IsOptional()
  department: string;

  @ApiProperty({
    description: '역할',
    example: 'DRIVER',
    enum: ['DRIVER', 'INSPECTOR', 'REVIEWER', 'ADMIN'],
    required: false,
  })
  @IsIn(['DRIVER', 'INSPECTOR', 'REVIEWER', 'ADMIN'])
  @IsOptional()
  role: string;

  @ApiProperty({
    description: '업로드할 파일',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  file: Express.MulterS3.File; // 파일 필드 추가

  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  @IsString()
  @IsOptional()
  heavyEquipmentId: string;

  @ApiProperty({
    description: '사용자 활성화',
    example: true,
    required: false,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return value; // 변환할 수 없는 경우 그대로 반환
  })
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
