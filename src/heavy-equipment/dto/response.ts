import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateHeavyEquipmentRequest } from './request';

export class UpdateHeavyEquipmentDto extends PartialType(
  CreateHeavyEquipmentRequest,
) {}

export class HeavyEquipmentResponse {
  @ApiProperty({ description: '공장 이름', example: '원자력 공장' })
  factoryName: string;

  @ApiProperty({ description: '장비 타입', example: '지게차' })
  type: string;

  @ApiProperty({ description: '장비 번호', example: 'A55' })
  equipmentNumber: string;

  @ApiProperty({ description: '활성 상태', example: true })
  isActive: boolean;

  @ApiProperty({ description: '생성일', example: '2025-02-05T05:50:04.116Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2025-02-05T05:50:04.116Z' })
  updatedAt: Date;

  @ApiProperty({ example: '67a2fc0c89ca50f1cee44e03' })
  id: string;
}
