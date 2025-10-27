import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), UserModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}


