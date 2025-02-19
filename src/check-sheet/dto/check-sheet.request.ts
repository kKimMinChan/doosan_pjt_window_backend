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
}

export class CheckSheetRequest {
  @ApiProperty({
    description: 'CheckItem & isOk',
    type: [Item],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true }) // ✅ 배열 내부 객체 검사
  @Type(() => Item) // ✅ 내부 객체 매핑
  @IsNotEmpty()
  items: Item[];

  // @ApiProperty({ description: '이미지 정보', type: [Image] })
  // @Optional()
  // @IsArray()
  // @ValidateNested({ each: true }) // ✅ 배열 내부 객체 검사
  // @Type(() => Image) // ✅ 내부 객체 매핑
  // images: Image[];

  @ApiProperty({
    description: '이미지 1',
    format: 'binary',
    required: false,
  })
  file: string;

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
  // @IsString()
  // @Optional()
  issue: string;

  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: true,
  })
  @IsString()
  heavyEquipment: string;

  @ApiProperty({
    description: '점검자 id',
    example: '67a31a37993b5f84b50e32c3',
    required: true,
  })
  @IsString()
  inspector: string;

  @ApiProperty({
    description: '확인자 id',
    example: '67a31796abd7b569e02dfff9',
    required: true,
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
  })
  @IsBoolean()
  @IsOptional()
  isOk: boolean | null;
}

export class UpdateCheckSheetRequest {
  @ApiProperty({
    description: 'CheckItemId & isOk',
    type: [UpdateItem],
    required: true,
  })
  @Optional()
  @IsArray()
  @ValidateNested({ each: true }) // ✅ 배열 내부 객체 검사
  @Type(() => UpdateItem) // ✅ 내부 객체 매핑
  items: UpdateItem[];

  @ApiProperty({ description: '이미지 정보', type: [Image] })
  @Optional()
  @IsArray()
  @ValidateNested({ each: true }) // ✅ 배열 내부 객체 검사
  @Type(() => Image) // ✅ 내부 객체 매핑
  images: Image[];

  @ApiProperty({ description: '이슈사항', example: '안전벨트 불량' })
  @Optional()
  @IsString()
  issue: string;
}
