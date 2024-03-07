import { Module } from '@nestjs/common';
import { ClientModule } from '@walnut/client';
import { AppointmentsService } from './appointment.service';
import { AppointmentsController } from './appointment.controller';
@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
  imports: [ClientModule],
})
export class AppointmentsModule {}
