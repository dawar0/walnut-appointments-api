import { Prisma } from '@walnut/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const UpdateAppointmentSchema = z.object({
  appointmentId: z.number(),
  slotId: z.number().optional(),
  name: z.string().optional(),
  age: z.number().optional(),
});
export class UpdateAppointmentDto extends createZodDto(
  UpdateAppointmentSchema,
) {}

export { UpdateAppointmentSchema };
