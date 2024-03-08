import { Module } from '@nestjs/common';
import { DBModule } from '@walnut/client';
import { InferenceService } from './inference.service';
import { InferenceController } from './inference.controller';
import { AppointmentsModule } from '../appointment';
import { SlotsModule } from '../slot';
import { LangchainService } from './utils/langchain.service';
@Module({
  controllers: [InferenceController],
  providers: [InferenceService, LangchainService],
  exports: [InferenceService, LangchainService],
  imports: [DBModule, AppointmentsModule, SlotsModule],
})
export class InferenceModule {}
