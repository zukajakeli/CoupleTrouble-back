import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Repository } from 'typeorm';
import {
  Conversation,
  ConversationSource,
} from './entities/conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { PromptsService } from 'src/prompts/prompts.service';
import { PromptCategory } from 'src/prompts/enums/prompt-category.enum';

@Injectable()
export class ConversationService {
  public GEMINI_API_KEY: string;
  public genAI: GoogleGenerativeAI;
  public aiModel: any;

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private promptsService: PromptsService,
  ) {
    this.GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
    this.genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);
    this.aiModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async sendToAI(inputText: string) {
    const prompt = await this.promptsService.findLatestGroupedByCategory(
      PromptCategory.CONVERSATION_ANALYSIS,
    );

    console.log('prompt', prompt);

    const res = await this.aiModel.generateContent(prompt + inputText);

    function cleanJsonString(str: string): string {
      return str
        .replace(/`/g, '') // Remove all backtick characters
        .replace(/json/gi, ''); // Remove all instances of "json" (case insensitive)
    }

    const cleanedResponse = cleanJsonString(res.response.text());

    return cleanedResponse;
  }

  async analyzeConversation(
    userId: string,
    inputText: string,
    source: ConversationSource,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const aiResponse = await this.sendToAI(inputText);

    const conversation = this.conversationRepository.create({
      text: inputText,
      analysis: aiResponse,
      source,
      user,
    });
    await this.conversationRepository.save(conversation);

    return {
      analysis: conversation.analysis,
      createdAt: conversation.createdAt,
      id: conversation.id,
      source: conversation.source,
    };
  }

  async getConversationsByUser(userId: string) {
    console.log('userId', userId);
    const conversations = await this.conversationRepository.find({
      where: { userId },
    });

    return conversations;
  }

  create(createConversationDto: CreateConversationDto) {
    return 'This action adds a new conversation';
  }

  findAll() {
    return `This action returns all conversation`;
  }

  async findOne(id: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with id ${id} not found`);
    }

    return conversation;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  async remove(id: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
    });

    if (!conversation) {
      // If the conversation doesn't exist, throw an error
      throw new NotFoundException(`Conversation with id ${id} not found`);
    }

    // Delete the conversation
    await this.conversationRepository.delete(id);
  }

  async getDashboardData(userId: string): Promise<{ lovePoints: number }> {
    const conversations = await this.conversationRepository.find({
      where: { userId },
    });
    if (!conversations || conversations.length === 0) {
      throw new NotFoundException(`No conversations found for user ${userId}`);
    }
    const allAnalysis = conversations.map(
      (conversation) => conversation.analysis,
    );

    const prompt = `
    you are relationship guru. Based on this conversation analysis of a couple, generate a love points score between 0 and 100, where 0 is the worst and 100 is the best. Also write down couple goals for the couple.
    This is conversations analysis of one couple, so considering all of the analysis together, generate a love points score and couple goals.
    return JSON object like this:
    {
      lovePoints: number,
      coupleGoals: string[]
    }
    `;

    const res = await this.aiModel.generateContent(
      prompt + allAnalysis.toString(),
    );

    console.log('res', res.response.text());

    // Mock data for now
    const mockLovePoints = 82; // Example value

    return Promise.resolve({
      lovePoints: mockLovePoints,
      coupleGoals: [
        "Improve active listening skills and empathetic responses.  Focus on understanding each other's perspectives without interrupting.",
        'Develop clear communication protocols for logistical and work-related issues, using shared calendars or to-do lists.',
        'Schedule regular dedicated time for intimacy and connection, separate from work discussions. Prioritize quality time and physical affection.',
        "Address and validate each other's emotional insecurities openly and honestly.  Create a safe space to express vulnerability without fear of judgment.",
        "Learn to de-escalate conflicts effectively. Practice using 'I' statements and focusing on resolving issues rather than assigning blame.",
        'Consider couples counseling to address underlying communication patterns and improve conflict-resolution strategies, particularly given the higher stress levels and unresolved conflicts.',
      ],
    });
  }
}
