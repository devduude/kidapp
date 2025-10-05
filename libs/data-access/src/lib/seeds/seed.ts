import { AppDataSource } from '../database/data-source';
import { Idea } from '../entities/idea.entity';
import { IdeaVote } from '../entities/idea-vote.entity';

const ideas = [
  {
    title: 'Awesome idea about Dark Mode',
    description: 'Add a beautiful dark mode theme that reduces eye strain and looks modern',
    votes: 12,
  },
  {
    title: 'The Beautiful redesign of Dashboard',
    description: 'Completely redesign the main dashboard with modern UI/UX principles',
    votes: 8,
  },
  {
    title: 'Fantastic feature for Real-time Notifications',
    description: 'Implement WebSocket-based real-time notifications for instant updates',
    votes: 15,
  },
  {
    title: 'Amazing enhancement to Performance',
    description: 'Optimize database queries and implement caching for faster load times',
    votes: 10,
  },
  {
    title: 'Brilliant idea about User Analytics',
    description: 'Add comprehensive analytics dashboard to track user behavior and engagement',
    votes: 6,
  },
  {
    title: 'The Elegant solution for Mobile App',
    description: 'Create a native mobile application for iOS and Android',
    votes: 20,
  },
  {
    title: 'Awesome improvement for Search Functionality',
    description: 'Add advanced search with filters, autocomplete, and fuzzy matching',
    votes: 9,
  },
  {
    title: 'The Stunning redesign of Profile Pages',
    description: 'Modernize user profile pages with customizable themes and layouts',
    votes: 7,
  },
  {
    title: 'Brilliant feature for Collaboration Tools',
    description: 'Enable team collaboration with shared workspaces and real-time editing',
    votes: 13,
  },
  {
    title: 'Amazing addition of AI Assistant',
    description: 'Integrate AI-powered assistant to help users with common tasks',
    votes: 18,
  },
  {
    title: 'Magnificent idea about Two-Factor Authentication',
    description: 'Add secure 2FA with SMS, email, and authenticator app support',
    votes: 14,
  },
  {
    title: 'The Wonderful enhancement for Export Features',
    description: 'Allow users to export data in multiple formats (CSV, PDF, Excel)',
    votes: 11,
  },
  {
    title: 'Fantastic addition of Multi-language Support',
    description: 'Internationalize the app with support for 20+ languages',
    votes: 16,
  },
  {
    title: 'Brilliant improvement for Offline Mode',
    description: 'Enable offline functionality with automatic sync when back online',
    votes: 19,
  },
  {
    title: 'Amazing feature for Custom Workflows',
    description: 'Let users create custom automation workflows with drag-and-drop',
    votes: 17,
  },
  {
    title: 'The Spectacular redesign of Onboarding',
    description: 'Create an interactive, gamified onboarding experience for new users',
    votes: 5,
  },
];

async function seed() {
  try {
    console.log('🌱 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected!');

    const ideaRepository = AppDataSource.getRepository(Idea);
    
    // Clear existing data using TRUNCATE CASCADE to handle foreign keys
    console.log('🗑️  Clearing existing data...');
    await AppDataSource.query('TRUNCATE TABLE "idea_vote", "app_idea" RESTART IDENTITY CASCADE');
    
    // Seed ideas
    console.log('🌱 Seeding ideas...');
    for (const ideaData of ideas) {
      const idea = ideaRepository.create(ideaData);
      await ideaRepository.save(idea);
      console.log(`   ✓ Created: ${idea.title}`);
    }

    console.log('');
    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Total ideas created: ${ideas.length}`);
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
