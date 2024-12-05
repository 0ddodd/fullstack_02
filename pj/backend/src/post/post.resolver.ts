import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { PostService } from './post.service';
import { PostDetails, PostType } from './post.type';
// import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { Prisma } from '@prisma/client';
import { GraphQLUpload } from 'graphql-upload-ts';

@Resolver(() => PostType)
export class PostResolver {
    constructor(private readonly postService: PostService) {}

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => PostType)
    async createPost(
        @Context() context: { req: Request },
        @Args({ name: 'video', type: () => GraphQLUpload }) video: any,
        @Args('text') text: string,
    ) {
        
        const userId = context.req.user.sub;
        const videoPath = await this.postService.saveVideo(video);
        const postData = {
            text,
            video: videoPath,
            user: { connect: { id: userId } }, 
        };

        return await this.postService.createPost(postData)
    };

    @Query(() => PostDetails)
    async getPostById(@Args('id') id: number) {
        return await this.postService.getPostById(id);
    };

    @Query(() => [PostType])
    async getPosts(
        @Args('skip', { type: () => Int, defaultValue: 0}) skip: number,
        @Args('take', { type: () => Int, defaultValue: 1}) take: number,
    ): Promise<PostType[]> {
        console.log('skip', skip, 'take', take)
        return await this.postService.getPosts(skip, take);
    }

    @Mutation(() => PostType)
    async deletePost(@Args('id') id: number) {
        return await this.postService.deletePost(id);
    }

    @Query(() => [PostType])
    async getPostsByUserId(@Args('userId') userId: number) {
        return await this.postService.getPostsByUserId(userId);
    }

}
