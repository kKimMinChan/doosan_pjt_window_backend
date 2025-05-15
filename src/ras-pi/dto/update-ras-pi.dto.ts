import { PartialType } from '@nestjs/swagger';
import { RasPiDto, WifiChangeDto } from './create-ras-pi.dto';

export class shutdownResponse extends PartialType(RasPiDto) {}

export class rebootResponse extends PartialType(RasPiDto) {}

export class wifiChangeResponse extends PartialType(WifiChangeDto) {}
