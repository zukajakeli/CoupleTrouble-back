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

    const prompt = `
    You are an AI assistant analyzing a conversation between two partners. Your goal is to assess their communication style, emotions, and relationship dynamics in detail. Based on the provided conversation transcript, return a structured JSON object containing:

1. **Sentiment Analysis**: The overall tone of the conversation (Positive, Neutral, Negative) with a short textual explanation.
2. **Emotional Mapping**: Detect the primary emotions expressed by each partner and provide a short description of how these emotions are reflected in the conversation.
3. **Communication Patterns**: 
   - Average response time in seconds.
   - Number of interruptions by each partner.
   - Word balance (percentage of total words spoken by each partner).
   - A short summary of how these patterns affect their communication.
4. **Conflict & Resolution Analysis**:
   - Whether a conflict was detected (true/false).
   - The number of resolution attempts made.
   - Escalation level (low, medium, high).
   - A short explanation of how the conflict developed and whether it was resolved.
5. **Key Topics**: Identify recurring themes in the conversation with a brief description of why they are important.
6. **Attachment Styles**: Predict each partner’s attachment style (Secure, Anxious, Avoidant) and provide a brief explanation for the classification.
7. **Love Language Detection**: Determine each partner’s primary love languages (Words of Affirmation, Acts of Service, Physical Touch, Quality Time, Gifts) and describe how they express or lack these in the conversation.
8. **Toxicity Score**: A score between 0 and 1 representing the level of toxic communication (0 being no toxicity, 1 being highly toxic) with an explanation of any harmful behaviors observed.
9. **AI Recommendations**: Provide two or more **detailed** suggestions on improving communication and emotional connection, with explanations tailored to this specific conversation.

Return only a properly formatted JSON object, without any extra text or explanations. Example format:
{
  conversation_title: string;
  sentiment_score: number;
  sentiment_description: string;
  emotion_partner_1: {
    emotions: string[];
    emotion_description: string;
  };
  emotion_partner_2: {
    emotions: string[];
    emotion_description: string;
  };
  communication_balance: {
    partner_1_words: number;
    partner_2_words: number;
    response_time_avg: string;
    interruptions: {
      partner_1: number;
      partner_2: number;
    };
    description: string;
  };
  tone_analysis: {
    tone_type: string;
    tone_intensity: string;
    description: string;
  };
  'Key Topics': {
    importance: string;
    themes: string[];,
  },
  relationship_dynamics: {
    power_dynamic: string;
    compliments_vs_criticism: {
      compliments: number;
      criticisms: number;
    };
    description: string;
  };
  communication_flow: {
    coherence: string;
    questions_vs_statements: {
      questions: number;
      statements: number;
    };
    description: string;
  };
  conflict_resolution: {
    detected: boolean;
    escalation_level: string;
    resolution_score: string;
    conflict_description: string;
  };
  emotional_regulation: {
    partner_1_regulation: string;
    partner_2_regulation: string;
    description: string;
  };
  Emotional Mapping: {
    partner_1: {
      description: string;
      emotions: any[]; 
    };
    partner_2: {
      description: string;
      emotions: any[]; 
    };
  };
  Attachment Styles: {
    partner_1: {
      style: string;
      explanation: string;
    };
    partner_2: {
      style: string;
      explanation: string;
    };
  };
  Communication Patterns: {
    average_response_time: string;
    description: string;
    interruptions: {
      partner_1: number;
      partner_2: number;
    };
    word_balance: {
      partner_1: number;
      partner_2: number;
    };
  };
  Love Language Detection: {
    partner_1: {
      description: string;
      languages: any[]; 
    };
    partner_2: {
      description: string;
      languages: any[]; 
    };
  };
  stress_indicators: {
    stress_level_partner_1: string;
    stress_level_partner_2: string;
    description: string;
  };
  love_languages: {
    partner_1: {
      languages: string[];
      description: string;
    };
    partner_2: {
      languages: string[];
      description: string;
    };
  };
  compatibility_index: number;
  recommendations: {
    title: string;
    description: string;
  }[];
}
    `;

    // const prompt =
    //   'Pretend you are a realtionship guru, you should analyze the conversation and help the couple improve their relationship. You should be spiritual, emotional and precise';

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
}
