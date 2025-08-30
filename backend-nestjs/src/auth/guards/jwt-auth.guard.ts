import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('=== JWT Guard 인증 시도 ===');
    console.log('Headers:', request.headers);
    console.log('Authorization Header:', request.headers.authorization);
    console.log('==========================');
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('=== JWT Guard 인증 결과 ===');
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);
    console.log('==========================');
    
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}
