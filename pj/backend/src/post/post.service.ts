import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { createWriteStream } from 'fs';
import { extname } from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDetails, PostType } from './post.type';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async saveVideo(video: {
    createReadStream: () => any
    filename: string;
    mimetype: string;
  }): Promise<string> {
    if (!video || !['video/mp4'].includes(video.mimetype)) {
      throw new BadRequestException(
        'Invalid video file format.'
      )
    };

    const videoName = `${Date.now()}${extname(video.filename)}`;
    const videoPath = `/files/$${videoName}`;
    const stream = video.createReadStream();
    const outputPath = `public${videoPath}`;
    const writeStream = createWriteStream(outputPath);
    stream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    })

    return videoPath;
  }

  async createPost(data: Prisma.PostCreateInput) {
    return await this.prisma.post.create({
      data
    })
  };

  async getPostById(id: number): Promise<PostDetails> {
    try {
      const post = await this.prisma.post.findUnique({
        where: {id},
        include: {user: true, likes: true, comments: true},
      });

      const postIds = await this.prisma.post.findMany({
        where: {userId: post.userId},
        select: {id: true}
      });

      return { ...post, otherPostIds: postIds.map((post) => post.id)}

    } catch (err) {
      throw new NotFoundException(err.message);
    }
  };

  async getPosts(skip: number, take: number): Promise<PostType[]> {
    return await this.prisma.post.findMany({
      skip,
      take,
      include: { user: true, likes: true, comments: true },
      orderBy: { createdAt: 'desc' }
    })
  };

  async getPostsByUserId(userId: number): Promise<PostType[]> {
    return await this.prisma.post.findMany({
      where: { userId },
      include: { user: true },
    })
  };

  async deletePost(id: number): Promise<void> {
    const post = await this.getPostById(id);

    try {
      const fs = await import('fs');
      fs.unlinkSync(`public${post.video}`);
      
    } catch (err) {
      throw new NotFoundException(err.message);
    }
    
    await this.prisma.post.delete({where: {id}});

  }


}
