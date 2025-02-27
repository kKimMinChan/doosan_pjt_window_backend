import { Optional } from '@nestjs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  IsIn,
  Matches,
} from 'class-validator';
import { CheckItemRequest } from 'src/check-item/dto/check-item-request.dto';
import { PaginationDto } from 'src/common-dto/pagination.dto';

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

export class ExistingImage {
  @ApiProperty({ description: '이미지 제목', example: '안전벨트' })
  @IsString()
  title: string;

  @ApiProperty({ description: '이미지 순번', example: 1 })
  @IsNumber()
  index: number;

  @ApiProperty({
    description: 'url',
    example: 'https://d33ycgiczd2w54.cloudfront.net/images/1740532351951.jpg',
  })
  @IsString()
  url: boolean;
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
    description: '이미지 file[]',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  file: string[];

  @ApiProperty({
    description:
      '이미지 제목, 인덱스 formData에 객체를 여러번 append해서 배열로 전달 fileInfo[]',
    type: [CreateImage],
    required: false,
  })
  @IsOptional()
  @IsArray()
  fileInfo: CreateImage[];

  @ApiProperty({
    description:
      '이미지 제목, 인덱스, 이미지 주소 formData에 객체를 여러번 append해서 배열로 전달 existingImage[]',
    type: [ExistingImage],
    required: false,
  })
  @IsOptional()
  @IsArray()
  existingImage: ExistingImage[];

  @ApiProperty({
    description: '이슈사항',
    example: '안전벨트 불량',
    required: false,
  })
  @IsString()
  @IsOptional()
  issue: string;

  @ApiProperty({
    description: '중장비 id',
    example: '67a2fc0c89ca50f1cee44e03',
    required: false,
  })
  @IsString()
  @IsOptional()
  heavyEquipment: string;

  @ApiProperty({
    description: '점검자 id',
    example: '67a31a37993b5f84b50e32c3',
    required: false,
  })
  @IsString()
  @IsOptional()
  inspector: string;

  @ApiProperty({
    description: '확인자 id',
    example: '67a31796abd7b569e02dfff9',
    required: false,
  })
  @IsString()
  @IsOptional()
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

export class CheckSheetPaginationDto extends PartialType(PaginationDto) {
  @ApiProperty({
    description:
      '점검 여부 유(CHECKED), 무(UNCHECKED), 전체(ALL) 기본 값 = ALL',
    enum: ['CHECKED', 'UNCHECKED', 'ALL'],
    example: 'ALL',
    required: false,
  })
  @IsOptional()
  @IsIn(['CHECKED', 'UNCHECKED', 'ALL'])
  inspectionStatus?: string = 'ALL';

  @ApiProperty({
    description: '검색 시작 날짜',
    example: '2025-02-19',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDay는 YYYY-MM-DD 형식이어야 합니다.',
  })
  startDay?: string;

  @ApiProperty({
    description: '검색 종료 날짜',
    example: '2025-02-28',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDay는 YYYY-MM-DD 형식이어야 합니다.',
  })
  endDay?: string;
}
