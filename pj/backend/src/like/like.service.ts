import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikeService {
    constructor(private readonly prisma: PrismaService) {}

    async likePost(data: CreateLikeDto) {
        return this.prisma.like.create({data});
    };

    async unlikePost(postId: number, userId: number) {
        return this.prisma.like.delete({
            where: { userId_postId: { postId, userId }}
        })
    };

}
