import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from 'src/admin/user/dto/response.dto';
import { CheckItemRequest } from 'src/check-item/dto/check-item-request.dto';
import { HeavyEquipmentResponse } from 'src/heavy-equipment/dto/response';

export class Item {
  @ApiProperty({ description: 'CheckItem' })
  checkItem: CheckItemRequest;

  @ApiProperty({
    description: '해당 항목이 체크되었는지 여부 (true, false, 또는 null)',
    example: true,
  })
  isOk: boolean | null;
}

export class Image {
  @ApiProperty({
    description: '이미지 제목',
    example: '안전벨트',
    required: false,
  })
  title: string;

  @ApiProperty({ description: '이미지 순번', example: 1, required: false })
  index: number;

  @ApiProperty({ description: '이미지 주소', required: false })
  url: string | null;
}

export class IssueResponse {
  @ApiProperty({
    description: '이슈사항',
    example: '안전벨트 불량',
    required: false,
  })
  issue: string;
}

export class CheckSheetResponse {
  @ApiProperty({
    description: 'CheckItem & isOk',
    type: [Item],
  })
  items: Item[];

  @ApiProperty({ description: '이미지 정보', type: [Image], required: false })
  images: Image[];

  @ApiProperty({
    description: '이슈사항',
    example: '안전벨트 불량',
    required: false,
  })
  issue: string;

  @ApiProperty({
    description: '해결 여부',
    example: false,
    required: false,
  })
  isSolved: boolean | null;

  @ApiProperty({
    description: '중장비',
    required: false,
  })
  equipment: HeavyEquipmentResponse;

  @ApiProperty({
    description: '점검자',
    required: false,
  })
  inspector: UserResponse;

  @ApiProperty({
    description: '확인자',
    required: false,
  })
  reviewer: UserResponse;

  @ApiProperty({
    description: '생성일',
    example: '2025-02-05T05:50:04.116Z',
    required: false,
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일',
    example: '2025-02-05T05:50:04.116Z',
    required: false,
  })
  updatedAt: Date;

  @ApiProperty({ example: '67a2fc0c89ca50f1cee44e03' })
  id: string;
}
