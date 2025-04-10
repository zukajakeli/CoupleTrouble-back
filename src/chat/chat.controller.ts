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
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/auth/guards/user.decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { CreateChannelDto } from './dto/create-channel.dto';
import { Request, Response } from 'express';
import { TriggerGuruDto } from './dto/trigger-guru.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-ai-user')
  async createAiUser() {
    return this.chatService.createUser('ai-assistant', {
      name: 'AI Assistant',
      image: 'https://example.com/ai-avatar.png',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('token')
  async generateToken(@User() user: UserEntity) {
    return this.chatService.createToken(user.id.toString());
  }
  @UseGuards(JwtAuthGuard)
  @Post('channel')
  async createChannel(@Body() body: CreateChannelDto) {
    const { members, data } = body;
    return this.chatService.createChannel(members, data);
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
      const isValid = await this.chatService.verifyWebhook(
        JSON.stringify(body),
        signature,
      );

      const { type, message, channel_id } = body;
      if (type !== 'message.new' || message?.user?.id === 'ai_agent') {
        console.log(
          `Webhook received, but not processing message type: ${type} from user: ${message?.user?.id}`,
        );
        return res
          .status(200)
          .send('Webhook acknowledged, no AI action needed.');
      }

      // const channelId = body.channel_id;
      const userMessage = message.text;
      const userName = message.user.first_name || message.user.id;

      // --- AI RESPONSE TRIGGERED VIA WEBHOOK (DISABLED) ---
      // console.log('Webhook processing message from:', userName);
      // console.log('Channel ID:', channel_id);
      // console.log('User Message:', userMessage);

      // // Generate AI response based on the new message
      // const aiResponse = await this.chatService.generateAIResponse(
      //   userName,
      //   userMessage,
      // );
      // console.log('aiResponse:', aiResponse);

      // // Send AI response to the chat
      // await this.chatService.sendAIMessage(channel_id, aiResponse);
      // --- END DISABLED AI RESPONSE ---

      // Acknowledge webhook receipt without triggering AI
      console.log(
        `Webhook processed for message from ${userName} in channel ${channel_id}, AI not triggered.`,
      );
      return res
        .status(200)
        .send('Webhook processed, AI response not triggered automatically.');
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).send('Error processing webhook');
    }
  }

  // New endpoint to trigger the Guru response manually
  @UseGuards(JwtAuthGuard) // Ensure user is authenticated
  @Post('trigger-guru')
  async triggerGuru(
    @Body() triggerGuruDto: TriggerGuruDto, // Use a DTO for request body validation
    @Res() res: Response,
  ) {
    const { channelId } = triggerGuruDto;
    console.log(`Guru trigger received for channel: ${channelId}`);

    if (!channelId) {
      return res.status(400).send('Channel ID is required');
    }

    try {
      // Generate a generic response from the AI
      // TODO: Add a new method in ChatService for this if needed,
      // or adapt generateAIResponse if possible. For now, let's assume
      // we might need a generic trigger method.
      // Placeholder: Using existing method structure but with a generic prompt initiator.
      // This might need adjustment in ChatService.
      const aiResponse = await this.chatService.generateAIResponse(
        'system', // Indicate it's a system/button trigger
        'Please provide some guidance, Guru.', // Generic prompt
      );

      // Send the AI response to the specified channel
      await this.chatService.sendAIMessage(channelId, aiResponse);

      console.log(`Guru response sent to channel: ${channelId}`);
      return res
        .status(200)
        .send({ message: 'Guru response triggered successfully' });
    } catch (error) {
      console.error(
        `Error triggering Guru response for channel ${channelId}:`,
        error,
      );
      return res.status(500).send('Error triggering Guru response');
    }
  }
}
