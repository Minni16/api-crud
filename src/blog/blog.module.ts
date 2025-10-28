import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity'; // imported User entity

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User]), UserModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}


