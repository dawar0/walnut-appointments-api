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
import { UpdateAppointmentSchema } from 'src/lib/appointment/dto/update-appointment-dto';

@Injectable()
export class LangchainService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly slotsService: SlotsService,
  ) {}

  async getExecutor(memory: BufferMemory) {
    const llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const tools = [
      new DynamicStructuredTool({
        name: 'getSlots',
        description:
          'Call this tool to get the available slots for booking appointments. You can filter the slots by date, booked, and past. Date should be formatted as ISO 8601. Booked and past are optional and should be formatted as boolean. If booked is true, it will return the booked slots. If past is true, it will return the past slots. If both are true, it will return both booked and past slots. If both are false, it will return the available slots. If both are not provided, it will return the available slots.',
        schema: z.object({
          date: z.string().optional().describe('The date to get slots for'),
          booked: z
            .boolean()
            .optional()
            .describe('Whether to get booked slots'),
          past: z.boolean().optional().describe('Whether to get past slots'),
        }),

        func: async (args) =>
          JSON.stringify(await this.slotsService.findSlots(args)),
      }),
      new DynamicStructuredTool({
        name: 'bookAppointment',
        description:
          "Book appointment. The params are: slotId (it should be a formatted as a number), name(it should be formatted as string) and age(it should be formatted as a number). Don't ask for slotId from the user, you can get it from the getSlots tool.",
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
      new DynamicStructuredTool({
        name: 'getAppointments',
        description: 'Get list of appointments by name, date and age',
        schema: z.object({
          name: z.string().describe('The name of the person'),
          date: z.string().describe('The date of the appointment'),
          age: z.number().describe('The age of the person'),
        }),
        func: async (args) =>
          JSON.stringify(
            await this.appointmentsService.findAppointments({
              age: args.age,
              date: args.date,
              name: args.name,
            }),
          ),
      }),

      new DynamicStructuredTool({
        name: 'updateAppointment',
        description:
          "Update appointment. You can change the slot of the appointment. You can also change the name and age of the person. The date should be formatted as ISO 8601. The slotId should be a number. If you don't know the slotId use getSlots tool The name should be a string. The age should be a number.",
        schema: UpdateAppointmentSchema.extend({
          id: z.number().describe('The id of the appointment'),
        }),
        func: async (args) =>
          JSON.stringify(
            await this.appointmentsService.updateAppointment(args.id, args),
          ),
      }),
      new DynamicStructuredTool({
        name: 'cancelAppointment',
        description: 'Cancel appointment. You can cancel the appointment.',
        schema: z.object({
          id: z.number().describe('The id of the appointment'),
        }),
        func: async (args) =>
          JSON.stringify(
            await this.appointmentsService.cancelAppointment(args.id),
          ),
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
        `You are an assitant at Dr. Smith's clinic. You can book appointments and get available slots. You have access to the following tools: getSlots, bookAppointment, getToday, updateAppointment. Keep it short and simple. Before Booking or updating the appointment ask for name and age. Today's date is ${new Date().toLocaleDateString()}.`,
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
      chat_history: (await memory.loadMemoryVariables({})).history,
    });

    await history.addUserMessage(query);
    await history.addAIMessage(result.output);

    return {
      result: result.output,
      sessionId: session,
    };
  }
}
