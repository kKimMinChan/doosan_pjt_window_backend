import { ApiProperty } from '@nestjs/swagger';

export class SystemStatusResponse {
  @ApiProperty({
    description: '오늘 안전 점검표가 제출이 되었는지',
    example: true,
    required: false,
  })
  hasValidCheckSheet: boolean;

  @ApiProperty({
    description: '오늘이 포함된 작업 기간을 갖는 작업계획서가 있는지 ',
    example: true,
    required: false,
  })
  hasValidWorkPlan: boolean;

  @ApiProperty({
    description: '작업계획서가 결재가 완료되었는지',
    example: true,
    required: false,
  })
  isSignedWorkPlan: boolean;

  @ApiProperty({
    description: '운전자가 작업 계획서에 포함되어 있는지',
    example: true,
    required: false,
  })
  isValidUser: boolean;

  @ApiProperty({
    description: '운전자가 작업 계획서에 사인을 했는지',
    example: true,
    required: false,
  })
  isSignedUser: boolean;

  @ApiProperty({
    description: '관리자인지',
    example: true,
    required: false,
  })
  isAdmin: boolean;
}
