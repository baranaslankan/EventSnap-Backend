import { IsString, IsOptional } from 'class-validator';

export class CreateGuestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  reference_photo_url?: string;
}