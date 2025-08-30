import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3000'], // 프론트엔드 URL
    credentials: true,
  });

  // 글로벌 유효성 검사 파이프 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    skipMissingProperties: false,
    forbidUnknownValues: false,
    disableErrorMessages: false, // 에러 메시지 활성화
    validationError: {
      target: false,
      value: false,
    },
    exceptionFactory: (errors) => {
      console.log('=== Validation Errors ===');
      errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`);
        console.log('  Property:', error.property);
        console.log('  Value:', JSON.stringify(error.value));
        console.log('  Constraints:', error.constraints);
        console.log('  Children:', error.children);
      });
      console.log('========================');
      return new ValidationPipe().createExceptionFactory()(errors);
    },
  }));

  await app.listen(3001);
  console.log('Backend server is running on http://localhost:3001');
}
bootstrap();
