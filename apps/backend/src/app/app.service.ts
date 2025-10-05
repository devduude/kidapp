import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Idea, IdeaVote } from '@kidapp/data-access';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Idea)
    private ideaRepository: Repository<Idea>,
    @InjectRepository(IdeaVote)
    private ideaVoteRepository: Repository<IdeaVote>,
  ) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  getHello(): { message: string } {
    return { message: '👋 Hello from the Backend! Welcome to your microservice architecture.' };
  }

  async getIdeas(): Promise<Idea[]> {
    return this.ideaRepository.find({
      order: {
        votes: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async getRandomIdeas(limit: number = 4): Promise<Idea[]> {
    const ideas = await this.ideaRepository
      .createQueryBuilder('idea')
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
    return ideas;
  }

  async voteForIdea(ideaId: number, ipAddress: string): Promise<{ success: boolean; votes: number; votesRemaining: number }> {
    const existingIdeaVote = await this.ideaVoteRepository.findOne({
      where: { ideaId, ipAddress },
    });

    if (existingIdeaVote) {
      throw new ConflictException('You have already voted for this idea');
    }

    const currentVoteCount = await this.ideaVoteRepository.count({
      where: { ipAddress },
    });

    if (currentVoteCount >= 10) {
      throw new ConflictException('You have reached the maximum number of votes (10)');
    }

    const queryRunner = this.ideaRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ideaVote = this.ideaVoteRepository.create({
        ideaId,
        ipAddress,
      });
      await queryRunner.manager.save(ideaVote);

      await queryRunner.manager.increment(Idea, { id: ideaId }, 'votes', 1);

      await queryRunner.commitTransaction();

      const updatedIdea = await this.ideaRepository.findOne({ where: { id: ideaId } });

      return {
        success: true,
        votes: updatedIdea?.votes || 0,
        votesRemaining: 10 - (currentVoteCount + 1),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserVoteStatus(ipAddress: string): Promise<{ voteCount: number; votedIdeaIds: number[] }> {
    const ideaVotes = await this.ideaVoteRepository.find({
      where: { ipAddress },
      select: ['ideaId'],
    });

    return {
      voteCount: ideaVotes.length,
      votedIdeaIds: ideaVotes.map((v) => v.ideaId),
    };
  }
}
