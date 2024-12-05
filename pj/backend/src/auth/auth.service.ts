import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ){}

  
  // validateToken 메서드 구현
  async validateToken(token: string): Promise<any> {
    try {
      // verifyAsync를 사용하여 토큰을 비동기적으로 검증
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });
      return payload;  // 유효한 토큰이면 페이로드 반환
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');  // 유효하지 않으면 예외 처리
    }
  }
  async refreshToken(req: Request, res: Response): Promise<string>{
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      console.log('refreshtoken 없음')
      throw new UnauthorizedException('Refresh token was not found.');
    }

    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!userExists) {
      throw new BadRequestException('User was not found.');
    }

    const expiresIn = 15000;
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;
    const accessToken = this.jwtService.sign(
      { ...payload, exp: expiration},
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET')
      }
    );
    console.log('xxxxxxxxxxx')
    console.log(accessToken);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      maxAge: expiresIn * 1000,
      sameSite: 'none',
      secure: true,
      path: '/'
    });

    return accessToken;
  };

  private async issueTokens(user: User, response: Response) {
    const payload = { username: user.fullname, sub: user.id };
    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '150sec',
      }
    );

    const refreshToken = this.jwtService.sign(
      payload,
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '7d',
      }
    );

    // console.log(accessToken, "~~~~~~~~~~" , refreshToken)

    response.cookie('access_token', accessToken, { 
      httpOnly: true, 
      maxAge: 150 * 1000,
      sameSite: 'none',
      secure: true,
      path: '/'
    });
    
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
      path: '/'
    });

    return { user, accessToken, refreshToken };
  };

  async validateUser (loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email }
    });

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      return user;
    };

    return null;
  };

  async register (registerDto: RegisterDto, response: Response) {
    const existedUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existedUser) {
      throw new BadRequestException({email: 'Email is already used.'});
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        fullname: registerDto.fullname,
        password: hashedPassword,
        email: registerDto.email,
      }
    });

    return this.issueTokens(user, response);
  };

  async login (loginDto: LoginDto, response: Response) {
    const user = await this.validateUser(loginDto);
    console.log(user)
    // console.log(response)

    if (!user) {
      throw new BadRequestException({invalidCredentials: 'Invalid Credentials.'});
    }
    
    const { accessToken, refreshToken } = await this.issueTokens(user, response);
    return { 
      user,
      accessToken,   // accessToken 반환
      refreshToken,  // refreshToken 반환
    };
  };

  async logout (response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return 'Logged out successfully.';
  }
  

}
