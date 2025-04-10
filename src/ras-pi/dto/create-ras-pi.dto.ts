import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RasPiDto {
  @ApiProperty({
    description: 'The Ip of the Raspberry Pi',
    example: '192.168.0.73',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  hostIp: string;

  @ApiProperty({
    description: 'The Hostname of the Raspberry Pi',
    example: 'fboe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  hostName: string;

  @ApiProperty({
    description: 'The password of the Raspberry Pi',
    example: 'fboe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  hostPassword: string;
}

export class WifiChangeDto extends PartialType(RasPiDto) {
  @ApiProperty({
    description: 'The SSID of the Wi-Fi network',
    example: 'MyWiFiNetwork',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  wifiSsid: string;

  @ApiProperty({
    description: 'The password for the Wi-Fi network',
    example: 'MySecurePassword',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  wifiPassword: string;
}
