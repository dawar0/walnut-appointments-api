import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SlotsService } from './slot.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@walnut/client';
import { CreateSlotDto } from './dto/create-slot-dto';
import { SlotEntity } from './entities/slot.entity';

@Controller('slot')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  @ApiOkResponse({
    description: 'Retrieve a list of slots based on query parameters.',
    type: [SlotEntity],
  })
  @ApiQuery({
    name: 'onDate',
    required: false,
    type: Date,
    description: 'Date to filter slots.',
  })
  @ApiQuery({ name: 'booked', required: false, type: Boolean })
  @ApiQuery({
    name: 'past',
    required: false,
    type: Boolean,
    description: 'If true, return all slots including past slots.',
  })
  findAll(
    @Query('onDate') onDate?: string,
    @Query('booked') booked?: boolean,
    @Query('past') past?: boolean,
  ) {
    return this.slotsService.findAll({
      date: onDate,
      booked,
      past,
    });
  }

  @Post()
  @ApiCreatedResponse({ type: SlotEntity, description: 'Create a new slot.' })
  createSlot(@Body() createSlotDto: CreateSlotDto) {
    return this.slotsService.createSlot(createSlotDto);
  }
}
