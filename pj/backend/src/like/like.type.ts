import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PostType } from "src/post/post.type";

@ObjectType()
export class LikeType {
    @Field(() => Int)
    id: number;

    @Field(() => Int)
    userId: number;

    @Field(() => Int)
    postId: number;
}