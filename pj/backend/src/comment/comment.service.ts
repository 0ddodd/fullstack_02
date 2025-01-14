import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentCreateInput } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
    constructor(private readonly prisma: PrismaService) {}

    async getCommentsByPostId(postId: number): Promise<Comment[]> {
        try {
            const comments = await this.prisma.comment.findMany({
                where: {
                    postId
                },
                include: {
                    user: true,
                    post: true
                }
            });
            return comments;
        } catch (err) {
            console.log(err)
        }
    };

    async createComment(data: CommentCreateInput): Promise<Comment>{
        return await this.prisma.comment.create({
            data,
            include: {
                user: true,
                post: true
            }
        })
    };

    async deleteComment(commentId: number, userId: number) {
        const comment = await this.prisma.comment.findUnique({
            where: {id: commentId}
        });

        if (!comment) {
            return new NotFoundException(
                `Comment with ID ${commentId} does not exist.`
            )
        };

        if (comment.userId !== userId) {
            throw new UnauthorizedException(
                "You do not have permission to delete this comment"
            )
        };

        return this.prisma.comment.delete({
            where: {id: commentId}
        })
    }
}
