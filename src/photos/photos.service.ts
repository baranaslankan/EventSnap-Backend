import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from './s3.service';

@Injectable()
export class PhotosService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async uploadPhoto(
    eventId: number,
    file: Express.Multer.File,
    photographerId: number,
  ) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, created_by: photographerId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const fileUrl = await this.s3Service.uploadFile(file);

    return this.prisma.photo.create({
      data: {
        event_id: eventId,
        file_url: fileUrl,
        uploaded_by: photographerId,
      },
    });
  }

  async uploadPhotos(eventId: number, files: Array<Express.Multer.File>, photographerId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, created_by: photographerId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const createdPhotos: any[] = [];
    for (const file of files) {
      const fileUrl = await this.s3Service.uploadFile(file);
      const photo = await this.prisma.photo.create({
        data: {
          event_id: eventId,
          file_url: fileUrl,
          uploaded_by: photographerId,
        },
      });
      createdPhotos.push(photo);
    }
    return createdPhotos;
  }

  async getEventPhotos(eventId: number, photographerId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, created_by: photographerId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.photo.findMany({
      where: { event_id: eventId },
      include: {
        tagged_guests: {
          include: {
            guest: true,
          },
        },
      },
    });
  }

  async tagGuest(photoId: number, guestId: number, photographerId: number) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { event: true },
    });

    if (!photo || photo.event.created_by !== photographerId) {
      throw new ForbiddenException('Access denied');
    }

    const guest = await this.prisma.guest.findFirst({
      where: { id: guestId, event_id: photo.event_id },
    });

    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    return this.prisma.photoGuest.create({
      data: {
        photo_id: photoId,
        guest_id: guestId,
      },
    });
  }

  async removeTag(photoId: number, guestId: number, photographerId: number) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { event: true },
    });

    if (!photo || photo.event.created_by !== photographerId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.photoGuest.delete({
      where: {
        photo_id_guest_id: {
          photo_id: photoId,
          guest_id: guestId,
        },
      },
    });
  }

  async deletePhoto(photoId: number, photographerId: number) {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
      include: { event: true },
    });

    if (!photo || photo.event.created_by !== photographerId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.photo.delete({
      where: { id: photoId },
    });
  }
}
