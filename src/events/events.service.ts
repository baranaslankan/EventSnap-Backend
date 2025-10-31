import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, photographerId: number) {
    return this.prisma.event.create({
      data: {
        ...createEventDto,
        date: new Date(createEventDto.date),
        created_by: photographerId,
      },
    });
  }

  async findAll(photographerId: number) {
    return this.prisma.event.findMany({
      where: { created_by: photographerId },
      include: {
        photos: true,
        guests: true,
      },
    });
  }

  async findOne(id: number, photographerId: number) {
    const event = await this.prisma.event.findFirst({
      where: { 
        id, 
        created_by: photographerId 
      },
      include: {
        photos: true,
        guests: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto, photographerId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id, created_by: photographerId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...updateEventDto,
        date: updateEventDto.date ? new Date(updateEventDto.date) : undefined,
      },
    });
  }

  async remove(id: number, photographerId: number) {
    const event = await this.prisma.event.findFirst({
      where: { id, created_by: photographerId },
      include: {
        guests: true,
        photos: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Delete all PhotoGuest relations for event photos
    await this.prisma.photoGuest.deleteMany({
      where: {
        photo_id: { in: event.photos.map(photo => photo.id) },
      },
    });

    // Delete all photos for the event
    await this.prisma.photo.deleteMany({
      where: { event_id: id },
    });

    // Delete all guests for the event
    await this.prisma.guest.deleteMany({
      where: { event_id: id },
    });

    // Now delete the event
    return this.prisma.event.delete({
      where: { id },
    });
  }
}
