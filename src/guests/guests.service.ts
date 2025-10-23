import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: number, createGuestDto: CreateGuestDto, photographerId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, created_by: photographerId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.guest.create({
      data: {
        ...createGuestDto,
        event_id: eventId,
      },
    });
  }

  async findAll(eventId: number, photographerId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, created_by: photographerId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.guest.findMany({
      where: { event_id: eventId },
      include: {
        photos: {
          include: {
            photo: true,
          },
        },
      },
    });
  }

  async findOne(guestId: number, photographerId: number) {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        event: true,
        photos: {
          include: {
            photo: true,
          },
        },
      },
    });

    if (!guest || guest.event.created_by !== photographerId) {
      throw new ForbiddenException('Access denied');
    }

    return guest;
  }

  async remove(guestId: number, photographerId: number) {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: { event: true },
    });

    if (!guest || guest.event.created_by !== photographerId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.guest.delete({
      where: { id: guestId },
    });
  }
}
