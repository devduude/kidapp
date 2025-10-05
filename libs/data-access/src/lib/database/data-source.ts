import { DataSource } from 'typeorm';
import { Idea } from '../entities/idea.entity';
import { IdeaVote } from '../entities/idea-vote.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'kidapp',
  entities: [Idea, IdeaVote],
  migrations: ['libs/data-access/src/lib/migrations/*.ts'],
  synchronize: false, // Disable auto-sync, use migrations instead
  logging: true,
});
