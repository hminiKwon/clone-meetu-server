import { IsString, MaxLength, MinLength } from 'class-validator';

export class EditProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(8)
  group: string;
}
