import { Injectable } from '@nestjs/common';
import { StreamChat } from 'stream-chat';
import {
  GenerativeModel,
  GoogleGenerativeAI,
  ChatSession,
} from '@google/generative-ai';

@Injectable()
export class ChatService {
  public chatClient: StreamChat;
  public genAI: GoogleGenerativeAI;
  public aiModel: GenerativeModel;
  private chatSession: ChatSession;

  constructor() {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;
    const genAIKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !apiSecret || !genAIKey) {
      throw new Error('Stream API credentials not found');
    }

    this.chatClient = StreamChat.getInstance(apiKey, apiSecret);
    this.genAI = new GoogleGenerativeAI(genAIKey);
    this.aiModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    this.chatSession = this.aiModel.startChat({
      history: [
        {
          role: 'user',
          parts: [
            {
              text: 'You are in a group chat with 2 other people, who are couple. Pretend you are the couples relationship guru. Be very professional, but also very kind and warm, really try to help the couple. Provide spiritual and practical answers.',
            },
          ],
        },
      ],
    });
  }

  getStreamClient(): StreamChat {
    return this.chatClient;
  }

  async createToken(userId: string): Promise<string> {
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
      console.log('query', query);
      console.log('currentUserId', currentUserId);

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

  async verifyWebhook(
    payload: string | Buffer,
    signature: string,
  ): Promise<boolean> {
    return this.chatClient.verifyWebhook(payload, signature);
  }

  async generateAIResponse(
    userName: string,
    userMessage: string,
  ): Promise<string> {
    const prompt =
      'You are in a group chat with 2 other people, who are couple. Pretend you are the couples relationship guru. Be very professional, but also very kind and warm, really try to help the couple. : ';

    try {
      // const res = await this.aiModel.generateContent(prompt + userMessage);
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
    await this.chatClient.upsertUser({
      id: 'ai_agent',
      name: 'Guru',
      role: 'admin',
    });
  }

  onModuleInit() {
    this.createAIUser(); // Register AI Agent when the module loads
  }
}
