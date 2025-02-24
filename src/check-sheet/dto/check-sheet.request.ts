import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { CheckItemRequest } from 'src/check-item/dto/check-item-request.dto';

export class Item {
  @ApiProperty({ description: 'CheckItem' })
  @ValidateNested()
  @Type(() => CheckItemRequest) // ✅ 내부 객체 매핑
  checkItem: CheckItemRequest;

  @ApiProperty({
    description: '해당 항목이 체크되었는지 여부 (true, false, 또는 null)',
    example: true,
    nullable: true,
  })
  @IsBoolean()
  @IsOptional()
  isOk: boolean | null;
}

export class Image {
  @ApiProperty({ description: '이미지 제목', example: '안전벨트' })
  @IsString()
  title: string;

  @ApiProperty({ description: '이미지 순번', example: 1 })
  @IsNumber()
  index: number;

  @ApiProperty({ description: '이미지 주소' })
  @IsString()
  @IsOptional()
  url: string | null;
}

export class CreateImage {
  @ApiProperty({ description: '이미지 제목', example: '안전벨트' })
  @IsString()
  title: string;

  @ApiProperty({ description: '이미지 순번', example: 1 })
  @IsNumber()
  index: number;

  @ApiProperty({ description: '존재 여부', example: true })
  @IsBoolean()
  exist: boolean;
}

export class CheckSheetRequest {
  @ApiProperty({
    description: 'CheckItem & isOk formData에 배열 데이터를 stringify해서 전달',
    type: [Item],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true }) // ✅ 배열 내부 객체 검사
  @Type(() => Item) // ✅ 내부 객체 매핑
  @IsNotEmpty()
  items: Item[];

  @ApiProperty({
    description: '이미지',
    format: 'binary',
    required: false,
  })
  file: string[];

  @ApiProperty({
    description:
      '이미지 제목, 인덱스 formData에 객체를 여러번 append해서 배열로 전달',
    type: [CreateImage],
    required: false,
  })
  @IsArray()
  imageInfo: CreateImage[];

  @ApiProperty({
    description: '이슈사항',
    example: '안전벨트 불량',
    required: false,
  })
  // @IsString()
  // @Optional()
  issue: string;

  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  @IsString()
  heavyEquipment: string;

  @ApiProperty({
    description: '점검자 id',
    example: '67a31a37993b5f84b50e32c3',
    required: false,
  })
  @IsString()
  inspector: string;

  @ApiProperty({
    description: '확인자 id',
    example: '67a31796abd7b569e02dfff9',
    required: false,
  })
  @IsString()
  reviewer: string;
}

export class UpdateItem {
  @ApiProperty({
    description: 'CheckItem id',
    example: '67b2cce73dd1ff6de078fb23',
  })
  @IsString()
  checkItem: string;

  @ApiProperty({
    description: '해당 항목이 체크되었는지 여부 (true, false, 또는 null)',
    example: true,
    nullable: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isOk: boolean | null;
}

export class UpdateCheckSheetRequest {
  @ApiProperty({
    description: 'CheckItemId & isOk',
    type: [Item],
    required: true,
  })
  @Optional()
  @IsArray()
  @ValidateNested({ each: true }) // ✅ 배열 내부 객체 검사
  @Type(() => Item) // ✅ 내부 객체 매핑
  items: Item[];

  @ApiProperty({
    description: '이미지',
    format: 'binary',
    required: false,
  })
  file: string[];

  @ApiProperty({
    description: '이미지 제목, 인덱스',
    type: [CreateImage],
    required: false,
  })
  @IsArray()
  imageInfo: CreateImage[];

  @ApiProperty({
    description: '이슈사항',
    example: '안전벨트 불량',
    required: false,
  })
  @Optional()
  @IsString()
  issue: string;
}
