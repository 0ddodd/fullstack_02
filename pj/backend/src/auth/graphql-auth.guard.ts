import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlCtx = context.getArgByIndex(2);
        const request: Request = gqlCtx.req;
        const response: Response = gqlCtx.res;

        const accessToken = this.extractTokenFromCookie(request, 'access_token');
        const refreshToken = this.extractTokenFromCookie(request, 'refresh_token');

        if (!accessToken && !refreshToken) {
            throw new UnauthorizedException('Access token and refresh token are missing');
        }

        try {
            // 1. Verify the access token
            const payload = await this.jwtService.verifyAsync(accessToken, {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            });

            // 2. Attach user payload to request
            request['user'] = payload;
            return true;

        } catch (err) {
            if (err.name === 'TokenExpiredError' && refreshToken) {
                console.log('Access token expired. Attempting to refresh...');
                // 3. Refresh access token using the refresh token
                const newAccessToken = await this.refreshAccessToken(refreshToken, response);
                if (!newAccessToken) {
                    throw new UnauthorizedException('Refresh token invalid or expired');
                }

                // 4. Re-attach the user info to the request after refreshing the token
                const payload = await this.jwtService.verifyAsync(newAccessToken, {
                    secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
                });
                request['user'] = payload;
                return true;
            }

            throw new UnauthorizedException('Access token invalid or expired');
        }
    }

    private async refreshAccessToken(refreshToken: string, response: Response): Promise<string | null> {
        try {
            // Verify the refresh token
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            });

            // Issue a new access token
            const newAccessToken = this.jwtService.sign(
                { userId: payload.userId }, // Include necessary payload data
                { secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'), expiresIn: '15m' }
            );

            // Optionally update the access token in the cookie
            response.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            return newAccessToken;

        } catch (err) {
            console.error('Failed to refresh access token:', err);
            return null;
        }
    }

    private extractTokenFromCookie(request: Request, key: string): string | undefined {
        return request.cookies?.[key];
    }
}
