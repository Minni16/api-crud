import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Blog } from './blog.entity';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UserService } from '../user/user.service';

// base route for blogs
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService, private readonly userService: UserService) {}

  @Post()
  create(@Body() createDto: CreateBlogDto): Promise<Blog> {
    return this.blogService.create(createDto);
  }

  @Get()
  async findAll(@Query('userId') userId: string): Promise<any[]> {
    const user = await this.userService.findById(userId);
    const blogs = await this.blogService.findAllForUser(user);
    return blogs.map((b) => ({ ...b, likesCount: (b.likedBy || []).length, likedBy: b.likedBy }));
  } // all blogs xuttai banaune, if no userid is given

  @Get('active')
  async findActive(@Query('userId') userId: string): Promise<any[]> {
    const user = await this.userService.findById(userId);
    const blogs = await this.blogService.findActiveForUser(user);
    return blogs.map((b) => ({ ...b, likesCount: (b.likedBy || []).length, likedBy: b.likedBy }));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateBlogDto): Promise<Blog> {
    return this.blogService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.blogService.remove(id);
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @Query('userId') userId: string): Promise<any> {
    const blog = await this.blogService.like(id, userId);
    return { ...blog, likesCount: (blog.likedBy || []).length, likedBy: blog.likedBy };
  }

  @Delete(':id/like')
  async unlike(@Param('id') id: string, @Query('userId') userId: string): Promise<any> {
    const blog = await this.blogService.unlike(id, userId);
    return { ...blog, likesCount: (blog.likedBy || []).length, likedBy: blog.likedBy };
  }
}


