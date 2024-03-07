import { ApiProperty } from '@nestjs/swagger';
import { Appointment } from '@prisma/client';
import { SlotEntity } from '@walnut/lib';

export class AppointmentEntity implements Appointment {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slotId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty({ type: () => SlotEntity })
  slot: SlotEntity;
}
