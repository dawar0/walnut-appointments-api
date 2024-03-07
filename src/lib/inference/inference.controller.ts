import { Controller, Get, Query } from '@nestjs/common';
import { InferenceService } from './inference.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('inference')
export class InferenceController {
  constructor(private readonly inferenceService: InferenceService) {}

  @Get()
  @ApiQuery({
    name: 'query',
    required: false,
    type: String,
    description: 'Query to infer.',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    type: String,
    description: 'Session ID.',
  })
  async getInference(
    @Query('query') query: string,
    @Query('sessionId') sessionId: string,
  ) {
    return this.inferenceService.getInference({ query, sessionId });
  }
}
