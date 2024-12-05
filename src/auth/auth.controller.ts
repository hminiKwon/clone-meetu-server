import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninCredentialDto } from './dto/signin-credential.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { SignupCredentialDto } from './dto/signup-credential.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(
    @Body(ValidationPipe) signupCredentialDto: SignupCredentialDto,
    @Body(ValidationPipe) editProfileDto: EditProfileDto,
  ) {
    return this.authService.signup(signupCredentialDto, editProfileDto);
  }

  @Post('/signin')
  signin(@Body(ValidationPipe) signinCredentialDto: SigninCredentialDto) {
    return this.authService.signin(signinCredentialDto);
  }

  @Get('/refresh')
  @UseGuards(AuthGuard())
  refresh(@GetUser() user: User) {
    return this.authService.refreshToken(user);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user);
  }

  @Patch('/me')
  @UseGuards(AuthGuard())
  editProfile(
    @Body(ValidationPipe) editProfileDto: EditProfileDto,
    @GetUser() user: User,
  ) {
    return this.authService.editProfile(editProfileDto, user);
  }

  @Post('/logout')
  @UseGuards(AuthGuard())
  logout(@GetUser() user: User) {
    return this.authService.deleteRefreshToken(user);
  }

  @Delete('/me')
  @UseGuards(AuthGuard())
  deleteAccount(@GetUser() user: User) {
    return this.authService.deleteAccount(user);
  }
}
