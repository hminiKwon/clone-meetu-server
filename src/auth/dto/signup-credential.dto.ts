import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { SigninCredentialDto } from './signin-credential.dto';

export class SignupCredentialDto extends SigninCredentialDto {
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: '이메일 형식이 아닙니다.',
  })
  email: string;
}
