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
    example: '운전자',
    enum: ['운전자', '점검자', '확인자', '관리자'],
    required: true,
  })
  @IsIn(['운전자', '점검자', '확인자', '관리자'])
  role: string;

  @ApiProperty({
    description: '업로드할 파일',
    type: 'string',
    format: 'binary',
    required: false,
  })
  file?: Express.Multer.File; // 파일 필드 추가
}

export class UpdateUserRequest extends PartialType(UserRequest) {
  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  @IsString()
  heavyEquipmentId?: string;

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
  isActive?: boolean;
}
