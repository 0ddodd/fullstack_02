import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { LikeType } from './like.type';
import { Request } from 'express';
import { LikeService } from './like.service';
import { PostType } from 'src/post/post.type';

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

    @Query(() => [PostType])
    async getLikedPostsByUser (
        @Args('userId') userId: number,
        @Context() ctx: {req: Request} 
    ) {
        return this.likeService.getLikedPostsByUser(userId);
    }
}
