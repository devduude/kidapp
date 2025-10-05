import { Controller, Get, Post, Param, Query, Req, HttpCode, HttpStatus, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { AppService } from './app.service';
import { VoteResponseDto, VoteStatusDto, IdeaDto, HealthCheckDto } from './dto/vote-response.dto';
import { GetRandomIdeasDto } from './dto/query.dto';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('hello')
  getHello() {
    return this.appService.getHello();
  }

  @Version('1')
  @Get('ideas')
  @ApiTags('ideas')
  @ApiOperation({ 
    summary: 'Get all ideas', 
    description: 'Returns all app improvement ideas sorted by votes and creation date' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved all ideas',
    type: [IdeaDto]
  })
  async getIdeas(): Promise<IdeaDto[]> {
    return this.appService.getIdeas();
  }

  @Version('1')
  @Get('ideas/random')
  @ApiTags('ideas')
  @ApiOperation({ 
    summary: 'Get random ideas', 
    description: 'Returns a random selection of app improvement ideas' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved random ideas',
    type: [IdeaDto]
  })
  async getRandomIdeas(@Query() query: GetRandomIdeasDto): Promise<IdeaDto[]> {
    return this.appService.getRandomIdeas(query.limit);
  }

  @Version('1')
  @Get('health')
  @ApiTags('health')
  @ApiOperation({ 
    summary: 'Health check', 
    description: 'Returns the health status of the backend service' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    type: HealthCheckDto
  })
  getHealth(): HealthCheckDto {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'backend',
      uptime: process.uptime(),
    };
  }

  @Version('1')
  @Post('ideas/:id/vote')
  @HttpCode(HttpStatus.OK)
  @ApiTags('votes')
  @ApiOperation({ 
    summary: 'Vote for an idea', 
    description: 'Cast a vote for a specific idea. Each IP can vote for up to 10 different ideas, and only once per idea.' 
  })
  @ApiParam({ 
    name: 'id', 
    type: Number, 
    description: 'The ID of the idea to vote for', 
    example: 1 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully voted',
    type: VoteResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Already voted for this idea or reached maximum votes (10)'
  })
  async voteForIdea(@Param('id') id: string, @Req() req: Request): Promise<VoteResponseDto> {
    const ideaId = parseInt(id, 10);
    const ipAddress = this.extractIpAddress(req);
    return this.appService.voteForIdea(ideaId, ipAddress);
  }

  @Version('1')
  @Get('votes/status')
  @ApiTags('votes')
  @ApiOperation({ 
    summary: 'Get vote status', 
    description: 'Returns the current user vote status including vote count and voted idea IDs' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved vote status',
    type: VoteStatusDto
  })
  async getVoteStatus(@Req() req: Request): Promise<VoteStatusDto> {
    const ipAddress = this.extractIpAddress(req);
    return this.appService.getUserVoteStatus(ipAddress);
  }

  private extractIpAddress(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = (forwarded as string).split(',');
      return ips[0].trim();
    }
    
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return realIp as string;
    }
    
    return req.socket.remoteAddress || 'unknown';
  }
}
