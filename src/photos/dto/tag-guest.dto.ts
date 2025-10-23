import { IsNumber } from 'class-validator';

export class TagGuestDto {
  @IsNumber()
  guestId: number;
}