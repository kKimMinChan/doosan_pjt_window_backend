import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateHeavyEquipmentRequest } from './request';

export class UpdateHeavyEquipmentDto extends PartialType(
  CreateHeavyEquipmentRequest,
) {}

export class HeavyEquipmentResponse {
  @ApiProperty({ description: '공장 이름', example: '원자력 공장' })
  factoryName: string;

  @ApiProperty({
    description: '장비 타입',
    example: 'forklift',
    enum: ['forklift', 'bogie', 'crane', 'transporter'],
  })
  type: string;

  @ApiProperty({ description: '장비 번호', example: 'A55' })
  equipmentNumber: string;

  @ApiProperty({
    description: '점검자 id',
    required: false,
    example: [
      {
        name: '김진환',
        department: '개발팀',
        imageUrl: 'images/1740531608489.jpg',
        role: 'inspector',
        createdAt: '2025-02-26T01:00:08.736Z',
        updatedAt: '2025-02-26T01:00:08.736Z',
        id: '67be67988ddc5a50916df195',
      },
    ],
  })
  inspectors: string[];

  @ApiProperty({
    description: '확인자 id',
    required: false,
    example: [
      {
        name: '김진환',
        department: '개발팀',
        imageUrl: 'images/1740531608489.jpg',
        role: 'reviewer',
        createdAt: '2025-02-26T01:00:08.736Z',
        updatedAt: '2025-02-26T01:00:08.736Z',
        id: '67be67988ddc5a50916df195',
      },
    ],
  })
  reviewers: string[];

  @ApiProperty({
    description: '운전자 id',
    required: false,
    example: [
      {
        name: '김진환',
        department: '개발팀',
        imageUrl: 'images/1740531608489.jpg',
        role: 'driver',
        createdAt: '2025-02-26T01:00:08.736Z',
        updatedAt: '2025-02-26T01:00:08.736Z',
        id: '67be67988ddc5a50916df195',
      },
    ],
  })
  drivers: string[];

  // @ApiProperty({ description: '활성 상태', example: true })
  // isDeleted: boolean;

  @ApiProperty({ description: '생성일', example: '2025-02-05T05:50:04.116Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2025-02-05T05:50:04.116Z' })
  updatedAt: Date;

  @ApiProperty({ example: '67a2fc0c89ca50f1cee44e03' })
  id: string;
}
