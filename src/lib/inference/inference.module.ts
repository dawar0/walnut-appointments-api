import { Module } from '@nestjs/common';
import { ClientModule } from '@walnut/client';
import { InferenceService } from './inference.service';
import { InferenceController } from './inference.controller';
import { AppointmentsModule } from '../appointment';
import { SlotsModule } from '../slot';
import { LangchainService } from './utils/langchain.service';
@Module({
  controllers: [InferenceController],
  providers: [InferenceService, LangchainService],
  exports: [InferenceService, LangchainService],
  imports: [ClientModule, AppointmentsModule, SlotsModule],
})
export class InferenceModule {}
