// import { PartialType } from '@nestjs/swagger';
// import { CreateUserDto } from './request.dto';

import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

// export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserResponse {
  @ApiProperty({
    description: '운전자 이름',
    example: '홍길동',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: '부서',
    example: '안전',
    required: true,
  })
  department: string;

  @ApiProperty({
    description: '역할',
    example: '운전자',
    enum: ['운전자', '점검자', '확인자', '관리자'],
    required: true,
  })
  role: string;

  @ApiProperty({
    description: '이미지 주소',
    required: true,
  })
  imageUrl: string;

  @ApiProperty({
    description: '재직 or 퇴직',
    example: true,
    required: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '생성된 시간',
    example: '2025-01-21T08:47:51.942Z',
    required: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정된 시간',
    example: '2025-01-21T08:47:51.942Z',
    required: true,
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Mongoose ObjectId',
    example: '64c75aebc9c70e27d8b5a9d2',
  })
  id: Types.ObjectId;
}
