import { ApiProperty } from '@nestjs/swagger';
import { Slot } from '@prisma/client';
import { AppointmentEntity } from '@walnut/lib';

export class SlotEntity implements Slot {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  dateFrom: Date;

  @ApiProperty()
  dateTo: Date;

  @ApiProperty()
  appointmentId: number | null;

  @ApiProperty({
    type: () => AppointmentEntity,
  })
  appointment: AppointmentEntity;
}
