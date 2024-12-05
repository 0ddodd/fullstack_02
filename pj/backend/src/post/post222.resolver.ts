import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { PostType } from './post.type';
import { PostService } from './post.service';
import { GqlAuthGuard } from 'src/auth/auth.guard';
import { GraphQLUpload } from 'graphql-upload-ts';
import { Request } from 'express';

@Resolver(() => PostType)
export class PostResolver {
  constructor(private readonly postService: PostService) {}

  @Mutation(() => PostType)
  @UseGuards(GqlAuthGuard) // 인증 Guard 적용
  async createPost(
    @Context() context: { req: Request },
    @Args('video', { type: () => GraphQLUpload }) video: any,
    @Args('text') text: string,
  ) {
    console.log(context.req)
    console.log('👽👽👽👽👽')
    console.log(context.req.user.sub); // req.user에서 사용자 정보 접근
  }
}