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
      url: 'postgres://VladislavShults:oIMdwYuk4s8z@ep-withered-feather-839634.eu-central-1.aws.neon.tech/neondb',
      port: 5432,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
