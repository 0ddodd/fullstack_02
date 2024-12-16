import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // console.log('canactivate')
        const gqlCtx = context.getArgByIndex(2);
        const request: Request = gqlCtx.req;
        // console.log(request)

        const token = this.extractTokenFromCookie(request);
        console.log(token);
        if (!token) {
            console.log('토큰 없음')
            throw new UnauthorizedException('Access token is missing');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            });
            // console.log('payload')
            // console.log(payload)
            request['user'] = payload;

        } catch (err) {
            console.log('err')
            console.log(err);
            throw new UnauthorizedException();
        }
            return true;
    }
        
    private extractTokenFromCookie(request: Request): string | undefined {
        // console.log(request)
        // console.log('🍪🍪🍪🍪🍪')
        // console.log(request.cookies)
        // console.log(request.headers)
        return request.cookies?.access_token;
    }
}