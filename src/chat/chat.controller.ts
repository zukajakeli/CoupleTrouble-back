import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  RawBodyRequest,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AiService } from './ai.service';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/auth/guards/user.decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateChannelDto } from './dto/create-channel.dto';
import { Request, Response } from 'express';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private aiService: AiService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-ai-user')
  async createAiUser() {
    return this.chatService.createUser('ai-assistant', {
      name: 'AI Assistant',
      image: 'https://example.com/ai-avatar.png',
    });
  }

  // @Post('webhook')
  // async handleWebhook(@Body() body: any) {
  //   // Process Stream Chat webhook
  //   if (body.type === 'message.new') {
  //     const message = body.message;
  //     const channel = body.channel;

  //     // Don't respond to AI's own messages
  //     if (message.user.id === 'ai-assistant') return;

  //     const aiResponse = await this.aiService.generateResponse(message.text);

  //     // Send AI response to the channel
  //     const channelInstance = this.chatService.chatClient.channel(
  //       channel.type,
  //       channel.id,
  //     );

  //     await channelInstance.sendMessage({
  //       text: aiResponse,
  //       user_id: 'ai-assistant',
  //     });
  //   }
  // }

  @UseGuards(JwtAuthGuard)
  @Get('token')
  async generateToken(@User() user: UserEntity) {
    return this.chatService.createToken(user.id.toString());
  }
  @UseGuards(JwtAuthGuard)
  @Post('channel')
  async createChannel(@Body() body: CreateChannelDto) {
    const { channelType, channelId, members, data } = body;
    return this.chatService.createChannel(
      channelType,
      channelId,
      members,
      data,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/search')
  async searchUsers(
    @Query('query') query: string,
    @Query('userId') currentUserId: string,
  ) {
    return this.chatService.searchUsers(query, currentUserId);
  }

  @Post('webhook')
  async handleMessage(
    @Body() body: any,
    @Headers('x-signature') signature: string,
    @Res() res: Response,
  ) {
    if (!body) {
      console.log(' body not available');
      return res.status(400).send(' body not available');
    }

    if (!signature) {
      console.error('No signature found in headers');
      return res.status(400).send('No webhook signature found');
    }

    try {
      // Verify webhook signature
      const isValid = await this.chatService.verifyWebhook(
        JSON.stringify(body),
        signature,
      );
      // if (!isValid) return { status: 'unauthorized' };

      // Extract message details
      const { type, message, channel_id } = body;
      if (type !== 'message.new' || message.user.id === 'ai_agent') return;

      // const channelId = body.channel_id;
      const userMessage = message.text;

      if (type == 'message.new') {
        console.log('Signature:', signature);
        console.log('body:', body);

        console.log('userId', message.user.id);
        console.log('isValid:', isValid);

        console.log('channelId:', channel_id);
        console.log('userMessage:', userMessage);
      }

      // Generate AI response
      const aiResponse = await this.chatService.generateAIResponse(userMessage);

      console.log('aiResponse:', aiResponse);

      // Send AI response to the chat
      await this.chatService.sendAIMessage(channel_id, aiResponse);
      return res.status(200).send('Webhook processed successfully');
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).send('Error processing webhook');
    }
  }
}
