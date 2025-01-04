import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { createWriteStream, existsSync, promises as fsPromises } from 'fs';
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
    const videoPath = `/files/${videoName}`;
    const stream = video.createReadStream();

    // render disk
    const publicDir = "/mnt/data";
    const outputPath = `${publicDir}${videoPath}`;

    console.log('videoName')
    console.log(videoName)
    console.log('videoPath')
    console.log(videoPath)
    console.log('stream')
    console.log(stream)
    console.log('publicDir')
    console.log(publicDir)
    console.log('outputPath')
    console.log(outputPath)

    const directoryPath = `${publicDir}/files`;
    console.log('directoryPath');
    console.log(directoryPath);

    if (!existsSync(directoryPath)) {
      await fsPromises.mkdir(directoryPath, { recursive: true });
    }

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

  async getPosts(skip: number, take: number, keyword: string): Promise<PostType[]> {
    return await this.prisma.post.findMany({
      skip,
      take,
      where: {
        text: keyword ? {
          contains: keyword,
          mode: 'insensitive'
        } : {}
      },
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

  async deletePost(id: number): Promise<PostType> {
    try {
      const post = await this.getPostById(id);
      
      console.log('post services video')
      console.log(post)
      console.log(post.video);
      
      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found.`);
      }
      
      const publicDir = "/mnt/data";
      
      const fs = await import('fs');
      fs.unlinkSync(`${publicDir}/${post.video}`);

      const deletedPost = await this.prisma.post.delete({
        where: {id},
        include: {user: true}
      });

      return deletedPost;
      
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  };

  async searchPosts(keyword: string):Promise<PostType[]> {
    return await this.prisma.post.findMany({
      where: {
        text: {
          contains: keyword,
          mode: "insensitive"
        }
      },
      include: {
        user: true,
        likes: true,
      }
    })
  }


}
