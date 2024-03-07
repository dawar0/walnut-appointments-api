import { Prisma } from '@walnut/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

const CreateSlotSchema = z.object({
  dateTo: z.string().datetime(),
  dateFrom: z.string().datetime(),
});

// class is required for using DTO as a type
export class CreateSlotDto extends createZodDto(CreateSlotSchema) {}
export { CreateSlotSchema };
