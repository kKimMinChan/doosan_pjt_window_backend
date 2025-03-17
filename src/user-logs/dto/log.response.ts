import { PartialType } from '@nestjs/swagger';
import { CreateLogDto } from './log.request';

export class UpdateLogDto extends PartialType(CreateLogDto) {}
