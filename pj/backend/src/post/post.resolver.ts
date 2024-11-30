import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { PostService } from './post.service';
import { PostType } from './post.type';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { Request } from 'express';

@Resolver(() => PostType)
export class PostResolver {
  // constructor(private readonly postService: PostService) {}

  // @Mutation(() => PostType)
  // async createPost(
  //   @Context() context: { req: Request },
  //   @Args({ name: 'video', type: () => GraphQLUpload }) video: any,
  //   @Args('text') text: string,
  // ) {

  // }
}
