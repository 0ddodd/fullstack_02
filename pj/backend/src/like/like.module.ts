import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { LikeResolver } from './like.resolver';
import { LikeService } from './like.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [LikeResolver, LikeService, PrismaService, JwtService, ConfigService]
})
export class LikeModule {}
