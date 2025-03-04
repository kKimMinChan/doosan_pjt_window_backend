import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHeavyEquipmentRequest {
  @ApiProperty({
    description: '공장 이름',
    example: '원자력 공장',
  })
  @IsString()
  factoryName: string;

  @ApiProperty({ description: '장비 타입', example: 'forklift' })
  @IsEnum(['forklift', 'bogie', 'crane', 'transporter'])
  type: string;

  @ApiProperty({ description: '장비 번호', example: 'A55' })
  @IsString()
  equipmentNumber: string;
}

export class UpdateHeavyEquipmentRequest extends PartialType(
  CreateHeavyEquipmentRequest,
) {
  @ApiProperty({
    description: '점검자 id',
    required: false,
    example: ['67b44273d4cb64b4e38dde95'],
  })
  @IsOptional()
  @IsArray()
  inspectors: string[];

  @ApiProperty({
    description: '확인자 id',
    required: false,
    example: ['67b44273d4cb64b4e38dde95'],
  })
  @IsOptional()
  @IsArray()
  reviewers: string[];

  @ApiProperty({
    description: '운전자 id',
    required: false,
    example: ['67b44273d4cb64b4e38dde95'],
  })
  @IsOptional()
  @IsArray()
  drivers: string[];

  // @ApiProperty({
  //   description: '활성 상태',
  //   example: true,
  //   required: false,
  // })
  // @IsOptional()
  // @IsBoolean()
  // isDeleted?: boolean;
}
