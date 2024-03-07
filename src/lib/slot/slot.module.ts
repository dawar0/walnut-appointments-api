import { Module } from '@nestjs/common';
import { ClientModule } from '@walnut/client';
import { SlotsService } from './slot.service';
import { SlotsController } from './slot.controller';
import { AppointmentsService } from '../appointment/appointment.service';
@Module({
  controllers: [SlotsController],
  providers: [SlotsService, AppointmentsService],
  exports: [SlotsService],
  imports: [ClientModule],
})
export class SlotsModule {}
