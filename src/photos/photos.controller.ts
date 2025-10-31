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
  NotFoundException,
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

  @Get('presigned')
  async getPresignedUrlQuery(
    @Query('key') key?: string,
    @Query('expires') expires?: string,
  ) {
    const expiresIn = expires ? parseInt(expires, 10) : 3600;
    if (!key) throw new NotFoundException('Key required');

    const normalized = this.normalizeAndDecodeKey(key);
    const candidates = [normalized];
    if (!normalized.startsWith('photos/')) candidates.push(`photos/${normalized}`);
    if (normalized.startsWith('photos/')) candidates.push(normalized.replace(/^photos\//, ''));

    for (const k of candidates) {
      try {
        const url = await this.photosService.getPhotoPresignedUrl(k, expiresIn);
        return { url };
      } catch {
        // try next candidate
      }
    }
    throw new NotFoundException('Presigned URL not found for key');
  }

  @Get('presigned/:key')
  async getPresignedUrlPath(
    @Param('key') key: string,
    @Query('expires') expires?: string,
  ) {
    const expiresIn = expires ? parseInt(expires, 10) : 3600;
    const normalizedKey = this.normalizeAndDecodeKey(key);
    return { url: await this.photosService.getPhotoPresignedUrl(normalizedKey, expiresIn) };
  }

  // Helper: normalize various forms (full URL, double-encoded, with/without photos/ prefix)
  private normalizeAndDecodeKey(raw: string): string {
    try {
      let k = raw;
      if (k.startsWith('http')) {
        try {
          k = new URL(k).pathname.replace(/^\//, '');
        } catch {}
      }
      for (let i = 0; i < 2; i++) {
        try {
          const d = decodeURIComponent(k);
          if (d === k) break;
          k = d;
        } catch {
          break;
        }
      }
      return k;
    } catch {
      return raw;
    }
  }
}
