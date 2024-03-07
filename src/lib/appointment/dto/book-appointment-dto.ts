import { Prisma } from '@walnut/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const BookAppointmentSchema = z.object({
  slotId: z.number().describe('The slot id'),
  name: z
    .string()
    .describe('The name of the person to book the appointment for'),
  age: z.number().describe('The age of the person to book the appointment for'),
});
export class BookAppointmentDto extends createZodDto(BookAppointmentSchema) {}
export { BookAppointmentSchema };
