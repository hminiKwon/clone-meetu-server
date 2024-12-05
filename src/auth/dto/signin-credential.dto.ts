import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SigninCredentialDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  userId: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]*$/, {
    message: 'password only accepts english, number and special',
  })
  password: string;
}
