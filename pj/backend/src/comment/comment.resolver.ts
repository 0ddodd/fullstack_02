import { Args, Resolver, Query, Mutation, Context } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { Comment } from './comment.type';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { Request } from 'express';

@Resolver()
export class CommentResolver {
    constructor(private readonly commentService: CommentService) {}

    @Query(() => [Comment])
    async getCommentsByPostId(@Args('postId') postId: number) {
        return this.commentService.getCommentsByPostId(postId);
    };

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => Comment)
    createComment(
        @Context() ctx: {req: Request},
        @Args('postId') postId: number,
        @Args('text') text: string,
    ) {
        return this.commentService.createComment({
            text,
            postId,
            userId: ctx.req.user.sub,
        })
    };


    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => Comment)
    deleteComment(@Args('id') id: number, @Context() ctx: {req: Request}) {
        return this.commentService.deleteComment(id, ctx.req.user.sub);
    }

}
