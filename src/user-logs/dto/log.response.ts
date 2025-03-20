import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../entities/log.schema';
import { UserInfo } from 'src/admin/user/entities/user.entity';
import { HeavyEquipment } from 'src/heavy-equipment/entities/heavy-equipment.entity';

export class UserLogResponse {
  @ApiProperty({
    description: '어떤 이벤트 발생했는가',
    enum: EventType,
  })
  event: string;

  @ApiProperty({
    description: '성공여부',
    example: true,
  })
  result: boolean | null;

  @ApiProperty({
    description: '운전자 id',
    example: {
      name: '홍길동',
      department: '안전',
      imageUrl: 'images/1739956955722.png',
      role: 'driver',
      isActive: false,
      createdAt: '2025-02-19T09:22:35.830Z',
      updatedAt: '2025-02-19T09:22:35.830Z',
      id: '67b5a2dbf716cd131c328749',
    },
  })
  user: UserInfo | null;

  @ApiProperty({
    description: '중장비 id',
    example: {
      drivers: [],
      factoryName: '원자력 공장(min)',
      type: 'FORKLIFT',
      equipmentNumber: 'A55',
      isActive: true,
      createdAt: '2025-02-05T05:50:04.116Z',
      updatedAt: '2025-02-18T09:28:32.981Z',
      inspectors: [],
      reviewers: [],
      id: '67a2fc0c89ca50f1cee44e03',
    },
  })
  equipment: HeavyEquipment | null;

  @ApiProperty({
    description: '이미지 주소',
    example: 'images/1742261940572.png_생성',
  })
  imageUrl: string;
}
