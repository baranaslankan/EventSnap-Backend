import { IsNumber, IsOptional } from 'class-validator';

export class UploadPhotoDto {
  @IsNumber()
  eventId: number;
}