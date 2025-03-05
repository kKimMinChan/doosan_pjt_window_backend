import { PartialType } from '@nestjs/swagger';
import { CreateRecordingDto } from './recording.request';

export class UpdateRecordingDto extends PartialType(CreateRecordingDto) {}
