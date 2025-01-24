import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

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
  file?: any; // 파일 필드 추가
}

export class UpdateUserRequest extends PartialType(UserRequest) {
  @ApiProperty({
    description: '이미지 주소',
    example: '/uploads/kim',
    required: false,
  })
  @IsString()
  imageUrl?: string;
}
