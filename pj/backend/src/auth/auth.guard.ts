import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;
        // 토큰 확인 및 사용자 정보 설정
        const token = req.headers.authorization?.split(' ')[1];
        console.log(req.headers);
        
        console.log(token);
        if (!token) return false;

        const user = await this.authService.validateToken(token);
        console.log(user);
        if (!user) return false;

        req.user = user; // 사용자 정보 설정
        return true;
    }
}