import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers () {
    return this.prisma.user.findMany({
      include: {
        posts: true
      }
    })
  };

  async updateProfile(
    userId: number,
    data: {fullname?: string, bio?: string, image?: string}
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullname: data.fullname,
        bio: data.bio,
        image: data.image
      }
    })
  }
}
