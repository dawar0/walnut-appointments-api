import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';
import { XataChatMessageHistory } from '@langchain/community/stores/message/xata';
import { getXataClient } from 'src/xata/client';
import { DynamicTool, DynamicStructuredTool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { AppointmentsService } from 'src/lib/appointment';
import { SlotsService } from 'src/lib/slot';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { randomUUID } from 'crypto';
import { z } from 'zod';

@Injectable()
export class LangchainService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly slotsService: SlotsService,
  ) {}

  async getExecutor(memory: BufferMemory) {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const tools = [
      new DynamicStructuredTool({
        name: 'getSlots',
        description:
          'Call this tool to get the available slots for booking appointments. You can filter the slots by date, booked, and past.',
        schema: z.object({
          date: z.string().optional().describe('The date to get slots for'),
          booked: z
            .boolean()
            .optional()
            .describe('Whether to get booked slots'),
          past: z.boolean().optional().describe('Whether to get past slots'),
        }),

        func: async (args) =>
          JSON.stringify(await this.slotsService.findAll(args)),
      }),
      new DynamicStructuredTool({
        name: 'bookAppointment',
        description:
          "Book appointment with slotId (it should be a formatted as a number), name(it should be formatted as string) and age(it should be formatted as a number). Don't ask for slotId from the user, you can get it from the getSlots tool.",
        schema: z.object({
          slotId: z.number().describe('The slot id'),
          name: z
            .string()
            .describe('The name of the person to book the appointment for'),
          age: z
            .number()
            .describe('The age of the person to book the appointment for'),
        }),
        func: async (args) =>
          JSON.stringify(await this.appointmentsService.bookAppointment(args)),
      }),
      new DynamicTool({
        name: 'getToday',
        description: "Get today's date",
        func: async () => new Date().toLocaleDateString(),
      }),
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        "You are an assitant at Dr. Smith's clinic. You can book appointments and get available slots. ",
      ],
      ['system', '{chat_history}'],
      ['human', '{input}'],

      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools,
      prompt,
    });

    return new AgentExecutor({
      agent: agent,
      tools,
      verbose: true,
      memory,
    });
  }

  getHistory(sessionId: string) {
    return new XataChatMessageHistory({
      table: 'messages',
      sessionId: sessionId,
      client: getXataClient(),
      apiKey: process.env.XATA_API_KEY,
    });
  }

  getMemory(sessionId: string) {
    const history = this.getHistory(sessionId);
    return new BufferMemory({
      chatHistory: history,
      outputKey: 'output',
      inputKey: 'input',
    });
  }
  async getInference({
    query,
    sessionId,
  }: {
    query: string;
    sessionId: string;
  }) {
    const session = sessionId ? sessionId : randomUUID();

    const memory = this.getMemory(session);
    const history = this.getHistory(session);
    const executor = await this.getExecutor(memory);

    const result = await executor.invoke({
      input: query,
      chat_history: await memory.loadMemoryVariables({}),
    });

    await history.addUserMessage(query);
    await history.addAIMessage(result.output);

    return {
      result: result.output,
      sessionId: session,
    };
  }
}
