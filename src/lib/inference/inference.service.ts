import { PrismaService } from '@walnut/client';
import { AppointmentsService } from '@walnut/lib';
import { SlotsService } from '../slot/slot.service';
import { Injectable } from '@nestjs/common';
import { LangchainService } from './utils/langchain.service';

@Injectable()
export class InferenceService {
  constructor(
    private prismaService: PrismaService,
    private readonly appointmentsService: AppointmentsService,
    private readonly slotsService: SlotsService,
    private readonly langchainService: LangchainService,
  ) {}
  async getInference({
    query,
    sessionId,
  }: {
    query: string;
    sessionId: string;
  }) {
    return await this.langchainService.getInference({ query, sessionId });
  }
}
