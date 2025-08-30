import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RelationshipToDeceased, PsychologicalSupportLevel } from '../entities/family-survey.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: Partial<User> }> {
    const { 
      username, 
      password, 
      name, 
      email, 
      isAdmin,
      birthDate,
      relationshipToDeceased,
      relationshipDescription,
      psychologicalSupportLevel,
      meetingParticipationDesire,
      personalNotes,
      privacyAgreement
    } = registerDto;

    // 중복 사용자명 확인
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new ConflictException('이미 존재하는 사용자명입니다.');
    }

    // 비밀번호 해시
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성 (설문조사 필드들 포함)
    const userData: Partial<User> = {
      username,
      password: hashedPassword,
      name,
      email,
      isAdmin: isAdmin || false,
      birthDate: birthDate ? new Date(birthDate) : null,
      relationshipToDeceased,
      relationshipDescription,
      psychologicalSupportLevel,
      meetingParticipationDesire: meetingParticipationDesire || false,
      personalNotes,
      privacyAgreement: privacyAgreement || false,
    };
    
    const user = this.userRepository.create(userData);

    const savedUser = await this.userRepository.save(user);

    // JWT 토큰 생성
    const payload = { username: savedUser.username, sub: savedUser.id };
    const access_token = this.jwtService.sign(payload);

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: Partial<User> }> {
    const { username, password } = loginDto;

    // 사용자 찾기 (username 또는 email로 검색)
    let user = await this.userRepository.findOne({ where: { username } });
    
    // username으로 찾지 못한 경우 email로 검색
    if (!user) {
      user = await this.userRepository.findOne({ where: { email: username } });
    }
    
    if (!user) {
      throw new UnauthorizedException('잘못된 사용자명/이메일 또는 비밀번호입니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('잘못된 사용자명/이메일 또는 비밀번호입니다.');
    }

    // JWT 토큰 생성
    const payload = { username: user.username, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    // 비밀번호 제외하고 반환
    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
