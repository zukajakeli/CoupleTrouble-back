import { Injectable } from '@nestjs/common';
import { StreamChat } from 'stream-chat';

@Injectable()
export class ChatService {
  private chatClient: StreamChat;

  constructor() {
    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Stream API credentials not found');
    }

    this.chatClient = StreamChat.getInstance(apiKey, apiSecret);
  }

  getStreamClient(): StreamChat {
    return this.chatClient;
  }

  async createToken(userId: string): Promise<string> {
    return this.chatClient.createToken(userId);
  }

  async createUser(userId: string, userData: any): Promise<any> {
    return this.chatClient.upsertUser({
      id: userId,
      ...userData,
    });
  }

  async createChannel(
    channelType: string,
    channelId: string,
    members: string[],
    data?: any,
  ): Promise<any> {
    const channel = this.chatClient.channel(channelType, channelId, {
      members,
      ...data,
    });

    await channel.create();
    return channel;
  }
}
