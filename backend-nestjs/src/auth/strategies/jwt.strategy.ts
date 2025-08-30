import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'hedra-avatar-secret-key-2025',
    });
  }

  async validate(payload: any) {
    console.log('=== JWT Strategy validate ===');
    console.log('Payload:', payload);
    
    const user = await this.authService.findById(payload.sub);
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found, throwing UnauthorizedException');
      throw new UnauthorizedException();
    }
    
    const result = { id: user.id, username: user.username, isAdmin: user.isAdmin };
    console.log('Returning user:', result);
    console.log('=============================');
    
    return result;
  }
}
