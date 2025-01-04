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
      // 1. ID로 게시물 조회
      const post = await this.getPostById(id);
      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found.`);
      }
  
      // 2. video 경로 설정 및 파일 삭제 처리
      const publicDir = "/mnt/data";
      if (post.video) {
        const fs = await import('fs/promises');
        const videoPath = `${publicDir}/${post.video}`.replace(/\/\//g, "/"); // 경로 정리
        
        try {
          // 파일 존재 여부 확인 및 삭제
          await fs.access(videoPath); // 파일 존재 확인
          await fs.unlink(videoPath); // 파일 삭제
          console.log(`File ${videoPath} successfully deleted.`);
        } catch (err) {
          if (err.code === "ENOENT") {
            // 파일이 없으면 경고 로그 출력 후 계속 진행
            console.warn(`File ${videoPath} not found. Skipping file deletion.`);
          } else {
            // 기타 에러는 다시 throw
            throw new Error(`Error deleting file: ${err.message}`);
          }
        }
      } else {
        console.warn(`No video file associated with post ID ${id}`);
      }
  
      // 3. 게시물 삭제
      const deletedPost = await this.prisma.post.delete({
        where: { id },
        include: { user: true },
      });
  
      return deletedPost;
  
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }
  

  // async deletePost(id: number): Promise<PostType> {
  //   try {
  //     const post = await this.getPostById(id);
      
  //     console.log('post services video')
  //     console.log(post)
  //     console.log(post.video);
      
  //     if (!post) {
  //       throw new NotFoundException(`Post with ID ${id} not found.`);
  //     }
      
  //     const publicDir = "/mnt/data";
      
  //     const fs = await import('fs');
  //     fs.unlinkSync(`${publicDir}/${post.video}`);

  //     const deletedPost = await this.prisma.post.delete({
  //       where: {id},
  //       include: {user: true}
  //     });

  //     return deletedPost;
      
  //   } catch (err) {
  //     throw new NotFoundException(err.message);
  //   }
  // };

  // async searchPosts(keyword: string):Promise<PostType[]> {
  //   return await this.prisma.post.findMany({
  //     where: {
  //       text: {
  //         contains: keyword,
  //         mode: "insensitive"
  //       }
  //     },
  //     include: {
  //       user: true,
  //       likes: true,
  //     }
  //   })
  // }


}
