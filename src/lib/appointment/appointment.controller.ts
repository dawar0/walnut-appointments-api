import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointment.service';
import { ApiBody, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import {
  BookAppointmentDto,
  BookAppointmentSchema,
} from './dto/book-appointment-dto';
import { AppointmentEntity } from './entities/appointment.entity';
import {
  UpdateAppointmentDto,
  UpdateAppointmentSchema,
} from './dto/update-appointment-dto';
import { zodToOpenAPI } from 'nestjs-zod';
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
    @Query('date') date?: string,
    @Query('past') past?: boolean,
    @Query('name') name?: string,
    @Query('age') age?: number,
  ) {
    return this.appointmentService.findAppointments({ date, past, name, age });
  }

  @Post()
  @ApiBody({
    schema: zodToOpenAPI(BookAppointmentSchema),
  })
  @ApiOkResponse({
    description: 'Book a new appointment.',
    type: AppointmentEntity,
  })
  createAppointment(@Body() BookAppointmentDto: BookAppointmentDto) {
    return this.appointmentService.bookAppointment(BookAppointmentDto);
  }

  @Post(':id')
  @ApiBody({
    schema: zodToOpenAPI(UpdateAppointmentSchema),
  })
  @ApiOkResponse({
    description: 'Update an appointment.',
    type: AppointmentEntity,
  })
  updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.updateAppointment(
      Number(id),
      updateAppointmentDto,
    );
  }

  @Delete(':id')
  @ApiOkResponse({
    description: 'Delete an appointment.',
    type: AppointmentEntity,
  })
  deleteAppointment(@Param('id') id: string) {
    return this.appointmentService.cancelAppointment(Number(id));
  }
}
