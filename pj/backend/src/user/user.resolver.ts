import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { LoginResponse, RegisterResponse } from 'src/auth/dto/auth-response.dto';
import { LoginDto, RegisterDto } from 'src/auth/dto/auth.dto';
import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { GraphQLErrorFilter } from 'src/filters/custom-exception.filter';
import { GraphqlAuthGuard } from 'src/auth/graphql-auth.guard';
import { GraphQLUpload } from 'graphql-upload-ts';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { createWriteStream } from 'fs';

@UseFilters(GraphQLErrorFilter)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: {res: Response}
  ): Promise<RegisterResponse> {

    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({
        confirmPassword: 'Password and confirm password are not the same.',
      });
    };

    const { user } = await this.authService.register(
      registerDto,
      context.res,
    );
    
    return { user };
    
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginDto: LoginDto,
    @Context() context: { req: Request, res: Response },
  ) {
    // console.log(context.req)
    return this.authService.login(loginDto, context.res);
  }

  @Mutation(() => String)
  async logout(@Context() context: { res: Response }) {
    return this.authService.logout(context.res);
  }

  @Mutation(() => String)
  async refreshToken(@Context() context: { req: Request; res: Response }) {
    try {
      return this.authService.refreshToken(context.req, context.res);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Query(() => [User])
  async getUsers() {
    return this.userService.getUsers();
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => User)
  async updateUserProfile(
    @Context() context: { req: Request },
    @Args('fullname', { type: () => String, nullable: true}) fullname?: string,
    @Args('bio', { type: () => String, nullable: true}) bio?: string,
    @Args('image', { type: () => GraphQLUpload, nullable: true}) image?: any
  ) {
    let imageUrl;
    if (image) imageUrl = await this.storeImageAndGetUrl(image);
  
    return this.userService.updateProfile(context.req.user.sub, {
      fullname,
      bio,
      image: imageUrl
    })
  };

  private async storeImageAndGetUrl(file: any): Promise<string>{
    const { createReadStream, filename } = await file;

    const uniqueFilename = `${uuidv4()}_${filename}`;
    const imagePath = join(process.cwd(), 'public', uniqueFilename);
    const imageUrl = `${process.env.APP_URL}/${uniqueFilename}`;
    
    const readStream = createReadStream();
    readStream.pipe(createWriteStream(imagePath));

    return imageUrl;
  }
}
