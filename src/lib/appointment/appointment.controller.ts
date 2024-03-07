import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppointmentsService } from './appointment.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@walnut/client';
import { BookAppointmentDto } from './dto/book-appointment-dto';
import { AppointmentEntity } from './entities/appointment.entity';

@Controller('appointment')
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentsService) {}
  @Get()
  @ApiOkResponse({
    description: 'Retrieve a list of appointments.',
    type: [AppointmentEntity],
  })
  @ApiQuery({
    name: 'date',
    required: false,
    type: Date,
    description: 'Date to filter appointments. Format: MM/DD/YYYY.',
  })
  @ApiQuery({
    name: 'past',
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Name to filter appointments.',
  })
  @ApiQuery({
    name: 'age',
    required: false,
    type: Number,
    description: 'Age to filter appointments.',
  })
  findAll(
    @Query('date') date?: Date,
    @Query('past') past?: 'true' | 'false',
    @Query('name') name?: string,
    @Query('age') age?: number,
  ) {
    return this.appointmentService.findAll({ date, past, name, age });
  }
  @Post()
  @ApiOkResponse({
    description: 'Book a new appointment.',
    type: AppointmentEntity,
  })
  createAppointment(@Body() BookAppointmentDto: BookAppointmentDto) {
    return this.appointmentService.bookAppointment(BookAppointmentDto);
  }
}
