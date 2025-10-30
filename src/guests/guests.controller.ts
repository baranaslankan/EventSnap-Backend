import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';

@Controller('guests')
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post('event/:eventId')
  create(
    @Param('eventId') eventId: string,
    @Body() createGuestDto: CreateGuestDto,
  ) {
    // Public guest kaydı, authentication yok
    return this.guestsService.create(+eventId, createGuestDto, undefined);
  }

  @Get('event/:eventId')
  findAll(@Param('eventId') eventId: string, @Request() req) {
    return this.guestsService.findAll(+eventId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.guestsService.findOne(+id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.guestsService.remove(+id, req.user.id);
  }
}
