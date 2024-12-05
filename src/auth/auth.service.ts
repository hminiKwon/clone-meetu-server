import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { SigninCredentialDto } from './dto/signin-credential.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import * as bcrypt from 'bcryptjs';
import { SignupCredentialDto } from './dto/signup-credential.dto';
// import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    // private configService: ConfigService,
  ) {}

  async signup(
    signupCredentialDto: SignupCredentialDto,
    editProfileDto: EditProfileDto,
  ) {
    const { email, userId, password } = signupCredentialDto;
    const { name, group } = editProfileDto;
    const salt = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      userId,
      email,
      password: hashedPassword,
      name,
      group,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      if (error.code === '23505') {
        throw new ConflictException('Existing email or Id');
      }
      throw new InternalServerErrorException('Error on Signin');
    }
  }

  private async getTokens(payload: { userId: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateHashedRefreshToken(id: number, refreshToken: string) {
    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    try {
      await this.userRepository.update(id, {
        hashedRefreshToken,
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async signin(signinCredentialDto: SigninCredentialDto) {
    const { userId, password } = signinCredentialDto;
    const user = await this.userRepository.findOneBy({ userId });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Not matched Id or Password');
    }

    const { accessToken, refreshToken } = await this.getTokens({ userId });
    await this.updateHashedRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshToken(user: User) {
    const { userId } = user;
    const { accessToken, refreshToken } = await this.getTokens({
      userId,
    });

    if (!user.hashedRefreshToken) {
      throw new ForbiddenException();
    }

    await this.updateHashedRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  getProfile(user: User) {
    const { password, hashedRefreshToken, ...rest } = user;

    return { ...rest };
  }

  async editProfile(editProfileDto: EditProfileDto, user: User) {
    const profile = await this.userRepository.findOneBy({ id: user.id });

    if (!profile) {
      throw new NotFoundException('This user does not exist.');
    }

    const { name, group } = editProfileDto;

    profile.name = name;
    profile.group = group;

    try {
      await this.userRepository.save(profile);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while editing your profile.',
      );
    }
  }

  async deleteRefreshToken(user: User) {
    try {
      await this.userRepository.update(user.id, { hashedRefreshToken: null });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteAccount(user: User) {
    try {
      await this.userRepository.delete(user.id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('You cannot withdraw');
    }
  }
}
