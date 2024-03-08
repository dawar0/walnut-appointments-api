import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, Prisma } from '@walnut/client';
import { BookAppointmentDto } from './dto/book-appointment-dto';
import { UpdateAppointmentDto } from './dto/update-appointment-dto';
import * as moment from 'moment';

@Injectable()
export class AppointmentsService {
  constructor(private prismaService: PrismaService) {}

  async findAppointments({
    date,
    past,
    name,
    age,
  }: {
    date?: string;
    past?: boolean;
    name?: string;
    age?: number;
  }) {
    // If date is not provided, return all appointments
    if (date === undefined) {
      return await this.prismaService.appointment.findMany({
        where: {
          name: name ? { contains: name } : undefined,
          age: age ? { equals: age } : undefined,
          slot: past ? {} : { dateFrom: { gte: new Date() } },
        },
        include: {
          slot: true,
        },
      });
    }

    // If date is provided, return appointments for that date
    let gtDate = moment(date);
    let lsDate = moment(date);
    gtDate.subtract(1, 'days');
    lsDate.add(1, 'days');
    return await this.prismaService.appointment.findMany({
      where: {
        name: name ? { contains: name } : undefined,
        age: age ? { equals: age } : undefined,
        slot: {
          dateFrom: {
            gt: gtDate.endOf('day').toDate(),
            lt: lsDate.startOf('day').toDate(),
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
  async updateAppointment(id: number, data: UpdateAppointmentDto) {
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
          connect: data.slotId ? { id: data.slotId } : undefined,
        },
        name: data.name
          ? {
              set: data.name,
            }
          : undefined,
        age: data.age
          ? {
              set: data.age,
            }
          : undefined,
      },
      where: { id: appointment.id },
    });
  }
  async cancelAppointment(id: number) {
    // check if appointment exists
    const appointment = await this.prismaService.appointment.findFirst({
      where: { id },
    });
    // delte appointment
    if (!appointment) {
      throw new HttpException('Appointment not found', 400);
    }

    const updateSlot = this.prismaService.slot.update({
      where: { appointmentId: id },
      data: {
        appointment: {
          disconnect: true,
        },
      },
    });
    const deleteAppointment = this.prismaService.appointment.delete({
      where: { id },
    });

    return this.prismaService.$transaction([updateSlot, deleteAppointment]);
  }
}
