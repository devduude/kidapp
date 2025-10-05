import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704463200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create app_idea table
    await queryRunner.query(`
      CREATE TABLE "app_idea" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "votes" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP
      );
    `);

    // Create idea_vote junction table to track individual votes per idea per IP
    await queryRunner.query(`
      CREATE TABLE "idea_vote" (
        "id" SERIAL PRIMARY KEY,
        "ipAddress" VARCHAR(45) NOT NULL,
        "ideaId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_idea_vote_ideaId" FOREIGN KEY ("ideaId") 
          REFERENCES "app_idea"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_idea_vote_ip_idea" UNIQUE ("ipAddress", "ideaId")
      );
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_idea_vote_ipAddress" ON "idea_vote" ("ipAddress");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_idea_vote_ideaId" ON "idea_vote" ("ideaId");
    `);

    // Create trigger function to automatically update updatedAt timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for app_idea table
    await queryRunner.query(`
      CREATE TRIGGER update_app_idea_updated_at
      BEFORE UPDATE ON "app_idea"
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_app_idea_updated_at ON "app_idea";
    `);
    
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Drop tables (CASCADE will drop idea_vote due to foreign key)
    await queryRunner.query(`
      DROP TABLE IF EXISTS "idea_vote" CASCADE;
    `);
    
    await queryRunner.query(`
      DROP TABLE IF EXISTS "app_idea" CASCADE;
    `);
  }
}
