import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { UserRole } from '../entities/user.entity';

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
    enum: ['driver', 'inspector', 'reviewer', 'admin'],
    required: false,
  })
  @IsIn(['driver', 'inspector', 'reviewer', 'admin'])
  role: UserRole;

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
    enum: ['driver', 'inspector', 'reviewer', 'admin'],
    required: false,
  })
  @IsIn(['driver', 'inspector', 'reviewer', 'admin'])
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
  equipmentId: string;

  // @ApiProperty({
  //   description: '사용자 활성화',
  //   example: true,
  //   required: false,
  // })
  // @Transform(({ value }) => {
  //   if (value === 'true' || value === '1' || value === true) return true;
  //   if (value === 'false' || value === '0' || value === false) return false;
  //   return value; // 변환할 수 없는 경우 그대로 반환
  // })
  // @IsBoolean()
  // @IsOptional()
  // isActive: boolean;
}

export type PaginationUserRole =
  | 'driver'
  | 'inspector'
  | 'reviewer'
  | 'admin'
  | 'all';

export class UserPaginationDto extends PartialType(PaginationDto) {
  @ApiProperty({
    description:
      'role에 대한 필터링 (driver, inspector, reviewer, admin, all) 기본 값 all',
    enum: ['driver', 'inspector', 'reviewer', 'admin', 'all'],
    example: 'all',
    required: false,
  })
  @IsOptional()
  @IsIn(['driver', 'inspector', 'reviewer', 'admin', 'all'])
  role?: PaginationUserRole = 'all';
}

export class UserFindRoleDto {
  @ApiProperty({
    description:
      'role에 대한 필터링 (driver, inspector, reviewer, admin) 기본 값 driver',
    enum: ['driver', 'inspector', 'reviewer', 'admin'],
    example: 'driver',
    required: false,
  })
  @IsOptional()
  @IsIn(['driver', 'inspector', 'reviewer', 'admin'])
  role?: PaginationUserRole = 'driver';
}
