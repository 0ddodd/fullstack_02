import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AuthService, JwtService, ConfigService, PrismaService],
  exports: [AuthService]
})
export class AuthModule {}
