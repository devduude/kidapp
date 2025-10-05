import { ApiProperty } from '@nestjs/swagger';

export class VoteResponseDto {
  @ApiProperty({ example: true, description: 'Whether the vote was successful' })
  success: boolean;

  @ApiProperty({ example: 13, description: 'Total number of votes for this idea' })
  votes: number;

  @ApiProperty({ example: 9, description: 'Number of votes remaining for this user (0-10)' })
  votesRemaining: number;
}

export class VoteStatusDto {
  @ApiProperty({ example: 5, description: 'Number of votes cast by this user (0-10)' })
  voteCount: number;

  @ApiProperty({ 
    example: [1, 3, 5, 7, 9], 
    description: 'Array of idea IDs the user has voted for',
    type: [Number]
  })
  votedIdeaIds: number[];
}

export class IdeaDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Dark Mode' })
  title: string;

  @ApiProperty({ example: 'Add a dark mode theme' })
  description: string;

  @ApiProperty({ example: 12 })
  votes: number;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z', type: String })
  createdAt: Date | string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z', type: String })
  updatedAt: Date | string;
}

export class HealthCheckDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'backend' })
  service: string;

  @ApiProperty({ example: 123.45 })
  uptime: number;
}
