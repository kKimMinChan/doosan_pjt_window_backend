import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateHeavyEquipmentRequest {
  @ApiProperty({
    description: '공장 이름',
    example: '원자력 공장',
  })
  @IsString()
  factoryName: string;

  @ApiProperty({ description: '장비 타입', example: '지게차' })
  @IsEnum(['지게차', '대차', '크레인'])
  type: string;

  @ApiProperty({ description: '장비 번호', example: 'A55' })
  @IsString()
  equipmentNumber: string;
}

export class UpdateHeavyEquipmentRequest extends PartialType(
  CreateHeavyEquipmentRequest,
) {
  @ApiProperty({
    description: '활성 상태',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
