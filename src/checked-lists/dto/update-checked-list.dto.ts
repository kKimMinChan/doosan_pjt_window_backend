import { PartialType } from '@nestjs/swagger';
import { CheckedListDto } from './create-checked-list.dto';

export class UpdateCheckedListDto extends PartialType(CheckedListDto) {}
