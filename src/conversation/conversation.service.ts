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

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendToAI(inputText: string) {
    const GEMINI_API_KEY = 'AIzaSyBLp1Lx9WYee8348t2Wf9YUdG0P6v27eHA';
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt =
      'Pretend you are a realtionship guru, you should analyze the conversation and help the couple improve their relationship. You should be spiritual, emotional and precise';

    const res = await model.generateContent(prompt + inputText);

    console.log({ res: res.response.text() });

    return res.response.text();
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

  async getConversationByUser(userId: string) {
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

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
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
}
