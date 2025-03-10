import { PartialType } from '@nestjs/swagger';
import { RecordingRequest } from './recording.request';

export class RecordingResponse extends PartialType(RecordingRequest) {}
