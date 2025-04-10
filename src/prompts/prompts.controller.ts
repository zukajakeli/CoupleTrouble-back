import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  ParseEnumPipe,
  // UseGuards, // Keep commented out if not needed
} from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { PromptCategory } from './enums/prompt-category.enum';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { RolesGuard } from '../auth/guards/roles.guard'; // Keep commented out
// import { Role } from '../auth/enums/role.enum'; // Keep commented out
// import { Roles } from 'src/auth/guards/roles.decorator'; // Keep commented out

@Controller('prompts')
// @UseGuards(RolesGuard) // Keep guards commented out if admin role not needed for history
// @Roles(Role.Admin)
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  create(@Body() createPromptDto: CreatePromptDto) {
    return this.promptsService.create(createPromptDto);
  }

  @Get('latest')
  findLatest(
    @Query('category', new ParseEnumPipe(PromptCategory, { optional: true }))
    category?: PromptCategory,
  ) {
    return this.promptsService.findLatestGroupedByCategory(category);
  }
  @Get('history')
  findHistory(
    @Query('category', new ParseEnumPipe(PromptCategory, { optional: true }))
    category?: PromptCategory,
  ) {
    return this.promptsService.findAllGroupedByCategorySortedByDate(category);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.promptsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePromptDto: UpdatePromptDto,
  ) {
    return this.promptsService.update(id, updatePromptDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.promptsService.remove(id);
  }
}
