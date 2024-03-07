import { Prisma } from '@walnut/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const UpdateAppointmentSchema = z.object({
  slotId: z.number(),
  name: z.string(),
  age: z.number(),
});
export class UpdateAppointmentDto extends createZodDto(
  UpdateAppointmentSchema,
) {}

export { UpdateAppointmentSchema };
