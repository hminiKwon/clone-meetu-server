import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeRomConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get('DATABASE_HOST'),
      port: Number(this.configService.get('DATABASE_PORT')),
      username: this.configService.get('USER_NAME'),
      password: this.configService.get('PASSWORD'),
      database: this.configService.get('DATABASE'),
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      synchronize: true,
    };
  }
}

// export const typeORMconfig: TypeOrmModuleOptions = {
//   type: 'mysql',
//   host: process.env.DATABASE_HOST,
//   port: Number(process.env.DATABASE_PORT),
//   username: process.env.USER_NAME,
//   password: process.env.PASSWORD,
//   database: process.env.DATABASE,
//   entities: [__dirname + '/../**/*.entity.{js,ts}'],
//   synchronize: process.env.NODE_ENV === 'production' ? false : true,
// };
