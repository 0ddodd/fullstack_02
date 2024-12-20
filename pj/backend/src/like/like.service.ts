import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLikeDto } from './dto/create-like.dto';

@Injectable()
export class LikeService {
    constructor(private readonly prisma: PrismaService) {}

    async likePost(data: CreateLikeDto) {
        console.log('like')
        return this.prisma.like.create({data});
    };

    async unlikePost(postId: number, userId: number) {
        console.log('unlike');

        // 해당 like 레코드가 존재하는지 먼저 확인
        const like = await this.prisma.like.findFirst({
            where: { userId, postId }
        });
        console.log(like);

        if (!like) {
            throw new Error('Like record not found');  // 레코드가 없으면 에러 발생
        }

        return this.prisma.like.delete({
            where: { userId_postId: { userId, postId }}
        })
    };

}
