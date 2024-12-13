import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id?: number;

  @Field()
  fullname: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  createdAt?: Date;
  
  @Field({ nullable: true })
  updatedAt?: Date;
}
