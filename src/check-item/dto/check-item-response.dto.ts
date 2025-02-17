import { PartialType } from '@nestjs/swagger';
import { CheckItemRequest } from './check-item-request.dto';

export class UpdateCheckItemDto extends PartialType(CheckItemRequest) {}
