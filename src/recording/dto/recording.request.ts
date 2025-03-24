import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

// export class Ip {
//   @ApiProperty({
//     description: 'The IP address of the recording',
//     example: '192.168.0.10:8080',
//     required: true,
//   })
//   ip: string;
// }

export class RecordingRequest {
  @ApiProperty({
    example: ['192.168.0.10:8080', '192.168.0.11:8080'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray() // ✅ 배열인지 확인
  @IsString({ each: true }) // ✅ 배열의 각 요소가 문자열인지 확인
  @IsNotEmpty({ each: true }) // ✅ 배열 요소가 빈 문자열이면 안됨
  cameraIps: string[];

  @ApiProperty({
    example: ['192.168.0.13:8080', '192.168.0.15:8080'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray() // ✅ 배열인지 확인
  @IsString({ each: true }) // ✅ 배열의 각 요소가 문자열인지 확인
  @IsNotEmpty({ each: true }) // ✅ 배열 요소가 빈 문자열이면 안됨
  pythonServerIps: string[];
}
