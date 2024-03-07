import { Module } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { APP_PIPE } from '@nestjs/core';
import { AppointmentsModule, SlotsModule, InferenceModule } from '@walnut/lib';

@Module({
  imports: [AppointmentsModule, SlotsModule, InferenceModule],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
