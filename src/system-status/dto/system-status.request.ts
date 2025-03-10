import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SystemStatusRequest {
  @ApiProperty({
    description: '중장비 id',
    example: '67a31a37993b5f84b50e32c3',
    required: false,
  })
  @IsOptional()
  @IsString()
  equipmentId: string;

  @ApiProperty({
    description: '사용자 id',
    example: '67a31a37993b5f84b50e32c3',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId: string;
}
