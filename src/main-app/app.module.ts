import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsPlatformModule } from '../infrastructure/modules/blogsPlatformModule';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    BlogsPlatformModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'ep-withered-feather-839634.eu-central-1.aws.neon.tech',
      port: 5432,
      username: 'VladislavShults',
      password: 'oIMdwYuk4s8z',
      database: 'neondb',
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
