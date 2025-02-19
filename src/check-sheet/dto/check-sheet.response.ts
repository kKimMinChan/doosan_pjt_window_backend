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
  @ApiProperty({ description: '이미지 제목', example: '안전벨트' })
  title: string;

  @ApiProperty({ description: '이미지 순번', example: 1 })
  index: number;

  @ApiProperty({ description: '이미지 주소' })
  url: string | null;
}

export class CheckSheetResponse {
  @ApiProperty({
    description: 'CheckItem & isOk',
    type: [Item],
  })
  items: Item[];

  @ApiProperty({ description: '이미지 정보', type: [Image] })
  images: Image[];

  @ApiProperty({
    description: '이슈사항',
    example: '안전벨트 불량',
  })
  issue: string;

  @ApiProperty({
    description: '중장비',
  })
  heavyEquipment: HeavyEquipmentResponse;

  @ApiProperty({
    description: '점검자',
  })
  inspector: UserResponse;

  @ApiProperty({
    description: '확인자',
  })
  reviewer: UserResponse;

  @ApiProperty({ description: '생성일', example: '2025-02-05T05:50:04.116Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2025-02-05T05:50:04.116Z' })
  updatedAt: Date;

  @ApiProperty({ example: '67a2fc0c89ca50f1cee44e03' })
  id: string;
}
