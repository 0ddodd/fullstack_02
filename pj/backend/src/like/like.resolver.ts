import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { LikeType } from './like.type';
import { Request } from 'express';
import { LikeService } from './like.service';

@UseGuards(GraphqlAuthGuard)
@Resolver()
export class LikeResolver {
    constructor(private readonly likeService: LikeService) {}

    @Mutation(() => LikeType)
    async likePost(
        @Args('postId') postId: number,
        @Context() ctx: { req: Request }
    ) {
        return this.likeService.likePost({
            userId: ctx.req.user.sub,
            postId
        })
    };

    @Mutation(() => LikeType)
    async unlikePost(
        @Args('postId') postId: number,
        @Context() ctx: {req: Request}
    ) {
        return this.likeService.unlikePost(postId, ctx.req.user.sub);
    }
}
