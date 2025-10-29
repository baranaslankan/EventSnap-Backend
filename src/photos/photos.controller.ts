import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { TagGuestDto } from './dto/tag-guest.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('photo'))
  uploadPhotos(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('eventId') eventId: string,
    @Request() req,
  ) {
    return this.photosService.uploadPhotos(+eventId, files, req.user.id);
  }

  @Get('event/:eventId')
  getEventPhotos(@Param('eventId') eventId: string, @Request() req) {
    return this.photosService.getEventPhotos(+eventId, req.user.id);
  }

  @Post(':id/tag')
  tagGuest(
    @Param('id') photoId: string,
    @Body() tagGuestDto: TagGuestDto,
    @Request() req,
  ) {
    return this.photosService.tagGuest(
      +photoId,
      tagGuestDto.guestId,
      req.user.id,
    );
  }

  @Delete(':photoId/guests/:guestId')
  removeTag(
    @Param('photoId') photoId: string,
    @Param('guestId') guestId: string,
    @Request() req,
  ) {
    return this.photosService.removeTag(+photoId, +guestId, req.user.id);
  }

  @Delete(':id')
  deletePhoto(@Param('id') photoId: string, @Request() req) {
    return this.photosService.deletePhoto(+photoId, req.user.id);
  }
}
