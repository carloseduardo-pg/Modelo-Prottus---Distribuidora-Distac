import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'vendedor@distac.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'distac123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;
}
