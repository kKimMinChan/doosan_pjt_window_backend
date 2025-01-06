import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export interface RecordStorageData {
  date: string;
  items: { time: string; thumbnail: string; extra: string }[];
}

export class RecordItem {
  @ApiProperty({
    description: '녹화 시작 시-분-초',
    example: '09-52-44',
  })
  @IsString()
  time: string;

  @ApiProperty({
    description: 'base 64 이미지',
    example: 'data:image/png;base64,',
  })
  @IsString()
  thumbnail: string;

  @ApiProperty({
    description: 'mp4 영상 파일 이름',
    example: 'extra.mp4',
  })
  @IsString()
  extra: string;
}

export class RecordDto {
  @ApiProperty({
    description: '년-월-일',
    example: '2024-12-24',
  })
  @IsString()
  date: string;

  @ApiProperty({
    type: [RecordDto],
    example: [
      {
        extra: 'extra.mp4',
        thumbnail: 'data:image/png;base64,/9j//gAQTGF2YzYxLjE5LjEwMAD',
        time: '19_56_47',
      },
      {
        extra: 'extra.mp4',
        thumbnail: 'data:image/png;base64,/9j//gAQTGF2YzYxLjE5LjEwMAD',
        time: '19_56_47',
      },
      {
        extra: 'extra.mp4',
        thumbnail: 'data:image/png;base64,/9j//gAQTGF2YzYxLjE5LjEwMAD',
        time: '19_56_47',
      },
    ],
  })
  items: RecordDto[];
}
