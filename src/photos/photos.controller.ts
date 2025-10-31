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
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
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
    return this.photosService.getEventPhotos(+eventId, req.user?.id);
  }

  @Post(':id/tag')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  removeTag(
    @Param('photoId') photoId: string,
    @Param('guestId') guestId: string,
    @Request() req,
  ) {
    return this.photosService.removeTag(+photoId, +guestId, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deletePhoto(@Param('id') photoId: string, @Request() req) {
    return this.photosService.deletePhoto(+photoId, req.user.id);
  }

  @Get('presigned/:key')
  async getPresignedUrl(
    @Param('key') key: string,
    @Query('expires') expires: string,
  ) {
    // expires parametresi opsiyonel, yoksa 3600 (1 saat) kullan
    const expiresIn = expires ? parseInt(expires, 10) : 3600;
    return {
      url: await this.photosService.getPhotoPresignedUrl(key, expiresIn),
    };
  }

  // Also accept ?key=... because path params break when key contains slashes or spaces.
  @Get('presigned')
  async getPresignedUrlByQuery(
    @Query('key') key: string,
    @Query('expires') expires: string,
  ) {
    const expiresIn = expires ? parseInt(expires, 10) : 3600;
    if (!key) {
      return { message: 'Missing key query parameter' };
    }

    // Some clients double-encode the key (space -> %20 -> %2520).
    // Iteratively decode until stable or up to 3 iterations.
    let decoded = key;
    for (let i = 0; i < 3; i++) {
      try {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      } catch (e) {
        // if decodeURIComponent fails, stop and use current value
        break;
      }
    }

    return {
      url: await this.photosService.getPhotoPresignedUrl(decoded, expiresIn),
    };
  }
}
