import { Injectable, OnModuleInit } from '@nestjs/common';
import { StreamChat } from 'stream-chat';
import {
  GenerativeModel,
  GoogleGenerativeAI,
  ChatSession,
} from '@google/generative-ai';
import { PromptsService } from 'src/prompts/prompts.service';
import { PromptCategory } from 'src/prompts/enums/prompt-category.enum';
import { Prompt } from 'src/prompts/entities/prompt.entity';

@Injectable()
export class ChatService implements OnModuleInit {
  public chatClient: StreamChat;
  public genAI: GoogleGenerativeAI;
  public aiModel: GenerativeModel;
  private chatSession: ChatSession;

  constructor(private readonly promptService: PromptsService) {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;
    const genAIKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !apiSecret || !genAIKey) {
      throw new Error('Stream API or Gemini API credentials not found');
    }

    this.chatClient = StreamChat.getInstance(apiKey, apiSecret);
    this.genAI = new GoogleGenerativeAI(genAIKey);
    this.aiModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async onModuleInit() {
    console.log('ChatService initializing...');
    const initialPromptData =
      await this.promptService.findLatestGroupedByCategory(
        PromptCategory.CHAT_GURU,
      );

    if (initialPromptData && initialPromptData instanceof Prompt) {
      this.chatSession = this.aiModel.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: initialPromptData.content }],
          },
        ],
      });
    }

    await this.createAIUser();
    console.log('ChatService initialized successfully.');
  }

  getStreamClient(): StreamChat {
    return this.chatClient;
  }

  createToken(userId: string): string {
    return this.chatClient.createToken(userId);
  }

  async createUser(id: string, userData: any): Promise<any> {
    userData.id = userData.id.toString();

    return this.chatClient.upsertUser({
      id: id,
      ...userData,
    });
  }

  async createChannel(members: string[], data?: any): Promise<any> {
    const channelType = 'messaging';
    const maxIdLength = 64;
    const channelId = Date.now().toString().substring(0, maxIdLength);

    const channel = this.chatClient.channel(channelType, channelId, {
      members,
      created_by_id: members[0],
      ...data,
    });

    const chan = await channel.create();

    return chan;
  }

  async searchUsers(query: string, currentUserId: string) {
    try {
      const response = await this.chatClient.queryUsers(
        {
          id: { $ne: currentUserId }, // Exclude current user
          $or: [
            { name: { $autocomplete: query } },
            { id: { $autocomplete: query } },
          ],
        },
        { name: 1 },
      );

      return response.users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async sendAIMessage(channelId: string, text: string) {
    try {
      const channel = this.chatClient.channel('messaging', channelId);
      await channel.sendMessage({
        text,
        user_id: 'ai_agent',
      });
    } catch (error) {
      console.error('Error sending AI message:', error);
    }
  }

  verifyWebhook(payload: string | Buffer, signature: string): boolean {
    return this.chatClient.verifyWebhook(payload, signature);
  }

  async generateAIResponse(
    userName: string,
    userMessage: string,
  ): Promise<string> {
    try {
      const res = await this.chatSession.sendMessage(
        `${userName}:${userMessage}`,
      );

      return res.response.text() || 'I am here to help!';
    } catch (error) {
      console.error('AI Response Error:', error);
      return 'Sorry, I am having trouble responding.';
    }
  }

  async createAIUser() {
    try {
      await this.chatClient.upsertUser({
        id: 'ai_agent',
        name: 'Guru',
        role: 'admin',
      });
      console.log('AI Agent user created/updated.');
    } catch (error) {
      console.error('Error creating/updating AI Agent user:', error);
    }
  }
}
