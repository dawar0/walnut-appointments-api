import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@walnut/client';
import { CreateSlotDto } from './dto/create-slot-dto';
import * as moment from 'moment';
import { equal } from 'assert';

@Injectable()
export class SlotsService {
  constructor(private prismaService: PrismaService) {}

  async createSlot(data: CreateSlotDto) {
    // If there is a slot that overlaps with the new slot, return error
    const slots = await this.prismaService.slot.findMany({
      where: {
        OR: [
          {
            dateFrom: {
              lte: data.dateTo,
            },
            dateTo: {
              gte: data.dateFrom,
            },
          },
          {
            dateTo: {
              equals: data.dateTo,
            },
          },
          {
            dateFrom: {
              equals: data.dateFrom,
            },
          },
        ],
      },
    });
    if (slots.length > 0) {
      throw new HttpException('Slot overlaps with another slot', 400);
    }

    return await this.prismaService.slot.create({
      data: {
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
      },
    });
  }

  async findAll({
    date,
    booked = false,
    past,
  }: {
    date?: string;
    booked?: boolean;
    past?: boolean;
  }) {
    // If date is not provided, return all slots
    if (date === undefined) {
      return await this.prismaService.slot.findMany({
        where: {
          dateFrom: past ? {} : { gte: new Date(Date.now()) },
          appointmentId: booked ? { not: null } : { equals: null },
        },
      });
    }

    // If date is provided, return slots for that date
    let gtDate = moment(date);
    let lsDate = moment(date);
    gtDate.subtract(1, 'days');
    lsDate.add(1, 'days');

    if (!gtDate.isValid()) {
      throw new HttpException('Invalid date', 400);
    }
    return await this.prismaService.slot.findMany({
      where: {
        AND: [
          {
            dateFrom: {
              gt: gtDate.endOf('day').toDate(),
              lt: lsDate.startOf('day').toDate(),
            },
          },
          {
            dateFrom: past ? {} : { gte: new Date(Date.now()) },
          },
        ],
        appointmentId: booked ? { not: null } : { equals: null },
      },
    });
  }
}
