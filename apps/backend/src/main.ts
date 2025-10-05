import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { TransformInterceptor } from './app/interceptors/transform.interceptor';
import { HttpExceptionFilter, AllExceptionsFilter } from './app/filters/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until logger is ready
  });
  
  // Use Winston logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  
  // Security: Helmet middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`, 'cdnjs.cloudflare.com'],
          scriptSrc: [`'self'`, `'unsafe-inline'`, 'cdnjs.cloudflare.com'],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        },
      },
    })
  );
  
  // Enable CORS with specific origin
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  
  // Set global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically
      },
    })
  );
  
  // Global response transformation
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Global exception filters
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter()
  );
  
  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Kidapp API')
    .setDescription('API documentation for the Kidapp application - App Improvement Ideas voting system')
    .setVersion('1.0')
    .addTag('ideas', 'Operations related to app improvement ideas')
    .addTag('votes', 'Operations related to voting')
    .addTag('health', 'Health check endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'Kidapp API Docs',
    customfavIcon: '💡',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-standalone-preset.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui.min.css',
    ],
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
  logger.log(`📚 API Documentation available at: http://localhost:${port}/${globalPrefix}/v1/docs`, 'Bootstrap');
  logger.log(`🔒 Security: Helmet enabled, CORS configured`, 'Bootstrap');
  logger.log(`✅ Validation: Global pipes active`, 'Bootstrap');
  logger.log(`🚦 Rate Limiting: 10 requests per minute`, 'Bootstrap');
}

bootstrap().catch((err) => {
  Logger.error('Failed to start application', err);
  process.exit(1);
});
