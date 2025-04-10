import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { PromptCategory } from './enums/prompt-category.enum';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
  ) {}

  async create(createPromptDto: CreatePromptDto): Promise<Prompt> {
    const prompt = this.promptRepository.create(createPromptDto);
    return this.promptRepository.save(prompt);
  }

  async findAll(): Promise<Prompt[]> {
    return this.promptRepository.find();
  }

  async findOne(id: string): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({ where: { id } });
    if (!prompt) {
      throw new NotFoundException(`Prompt with ID "${id}" not found`);
    }
    return prompt;
  }

  async update(id: string, updatePromptDto: UpdatePromptDto): Promise<Prompt> {
    const prompt = await this.promptRepository.preload({
      id: id,
      ...updatePromptDto,
    });
    if (!prompt) {
      throw new NotFoundException(`Prompt with ID "${id}" not found`);
    }
    return this.promptRepository.save(prompt);
  }

  /**
   * Finds the latest prompt for each category, or only for a specific category if provided.
   * @param category Optional category to filter by.
   * @returns An array containing the latest prompt for each category, or a single latest prompt if a category is specified (or null if none found for that category).
   */
  async findLatestGroupedByCategory(
    category?: PromptCategory,
  ): Promise<Prompt[] | Prompt | null> {
    if (category) {
      // If a category is provided, find the latest prompt for that specific category
      return this.promptRepository.findOne({
        where: { category },
        order: { createdAt: 'DESC' },
      });
      // findOne returns the entity or null if not found, matching the Promise<... | null> part
    } else {
      // If no category is provided, find the latest for each category (existing logic)
      const allPrompts = await this.promptRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });

      const foundCategories = new Set<PromptCategory>();
      const latestPromptsArray: Prompt[] = [];

      for (const prompt of allPrompts) {
        if (!foundCategories.has(prompt.category)) {
          latestPromptsArray.push(prompt);
          foundCategories.add(prompt.category);
        }
      }
      return latestPromptsArray; // Matches the Promise<Prompt[]> part
    }
  }

  /**
   * Finds all prompts, grouped by category and sorted by date, or only for a specific category if provided.
   * @param category Optional category to filter by.
   * @returns A Record of categories to sorted prompt arrays, or a single sorted array if a category is specified.
   */
  async findAllGroupedByCategorySortedByDate(
    category?: PromptCategory,
  ): Promise<Record<PromptCategory, Prompt[]> | Prompt[]> {
    if (category) {
      // If category is provided, find and return only prompts for that category, sorted
      return this.promptRepository.find({
        where: { category },
        order: { createdAt: 'ASC' }, // Sort oldest first for history
      });
      // find returns Prompt[] directly, matching the Promise<... | Prompt[]> part
    } else {
      // If no category provided, return history grouped by all categories (existing logic)
      const allPrompts = await this.promptRepository.find();

      const groupedPrompts: Record<PromptCategory, Prompt[]> = {} as Record<
        PromptCategory,
        Prompt[]
      >;
      for (const cat of Object.values(PromptCategory)) {
        groupedPrompts[cat] = [];
      }

      for (const prompt of allPrompts) {
        if (groupedPrompts[prompt.category]) {
          groupedPrompts[prompt.category].push(prompt);
        }
      }

      for (const cat of Object.values(PromptCategory)) {
        groupedPrompts[cat].sort(
          (a: Prompt, b: Prompt) =>
            a.createdAt.getTime() - b.createdAt.getTime(),
        );
      }
      return groupedPrompts; // Matches the Promise<Record<...> | ...> part
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.promptRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Prompt with ID "${id}" not found`);
    }
  }
}
