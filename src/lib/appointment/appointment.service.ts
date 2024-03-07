import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, Prisma } from '@walnut/client';
import { BookAppointmentDto } from './dto/book-appointment-dto';
import { UpdateAppointmentDto } from './dto/update-appointment-dto';
import * as moment from 'moment';

@Injectable()
export class AppointmentsService {
  constructor(private prismaService: PrismaService) {}

  async findAll({
    date,
    past,
    name,
    age,
  }: {
    date?: Date;
    past?: 'true' | 'false';
    name?: string;
    age?: number;
  }) {
    // If date is not provided, return all appointments
    if (date === undefined) {
      return await this.prismaService.appointment.findMany({
        where: {
          name: name ? { contains: name } : undefined,
          age: age ? { equals: age } : undefined,
          slot: past === 'true' ? {} : { dateFrom: { gte: new Date() } },
        },
        include: {
          slot: true,
        },
      });
    }

    // If date is provided, return appointments for that date
    let gtDate = moment(date);
    let lsDate = moment(date);
    lsDate.add(1, 'days');
    return await this.prismaService.appointment.findMany({
      where: {
        name: name ? { contains: name } : undefined,
        age: age ? { equals: age } : undefined,
        slot: {
          dateFrom: {
            gte: gtDate.toDate(),
            lt: lsDate.toDate(),
          },
        },
      },
      include: {
        slot: true,
      },
    });
  }
  async bookAppointment(data: BookAppointmentDto) {
    // If slot is already booked, return error
    const slot = await this.prismaService.slot.findFirst({
      where: { id: data.slotId },
    });
    if (!slot) throw new HttpException('Slot not found', 400);
    if (slot.appointmentId) throw new HttpException('Slot already booked', 400);

    //

    return await this.prismaService.appointment.create({
      data: {
        name: data.name,
        age: data.age,
        slot: {
          connect: { id: data.slotId },
        },
      },
      include: {
        slot: true,
      },
    });
  }
  async updateAppointment(id, data: UpdateAppointmentDto) {
    // check if appointment exists
    const appointment = await this.prismaService.appointment.findFirst({
      where: { id },
    });
    if (!appointment) {
      throw new HttpException('Appointment not found', 400);
    }
    return await this.prismaService.appointment.update({
      data: {
        slot: {
          connect: { id: data.slotId },
        },
      },
      where: { id },
    });
  }
  async cancelAppointment(id) {
    // check if appointment exists
    const appointment = await this.prismaService.appointment.findFirst({
      where: { id },
    });
    // delte appointment
    if (!appointment) {
      throw new HttpException('Appointment not found', 400);
    }
    return await this.prismaService.appointment.delete({
      where: { id },
    });
  }
}
