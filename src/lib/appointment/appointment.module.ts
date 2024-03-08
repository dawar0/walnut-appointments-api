import { Module } from '@nestjs/common';
import { DBModule } from '@walnut/client';
import { AppointmentsService } from './appointment.service';
import { AppointmentsController } from './appointment.controller';
@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
  imports: [DBModule],
})
export class AppointmentsModule {}
