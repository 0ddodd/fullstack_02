import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationContext } from 'graphql';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  
  app.enableCors({
    origin: 'https://fancy-tarsier-a66579.netlify.app',
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight'
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
  });
  
  // app.use(cookieParser());

  // `graphql-upload` 미들웨어 설정
  app.use(graphqlUploadExpress());
  
  // 정적 파일 제공 (프사, 비디오)
  const publicDir = '/mnt/data';
  app.use('/public', express.static(publicDir));
  app.use('/files', express.static(publicDir));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((accumulator, error) => {
          accumulator[error.property] = Object.values(error.constraints).join(
            ', ',
          );
          return accumulator;
        }, {});
        
        throw new BadRequestException(formattedErrors);
      },
    }),
  );
  
  await app.listen(3000);


}
bootstrap();
