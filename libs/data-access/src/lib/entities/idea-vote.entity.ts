import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Idea } from './idea.entity';

@Entity('idea_vote')
export class IdeaVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ type: 'int' })
  ideaId: number;

  @ManyToOne(() => Idea)
  @JoinColumn({ name: 'ideaId' })
  idea: Idea;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
