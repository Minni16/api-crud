import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Blog } from './blog.entity';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

// base route for blogs
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  create(@Body() createDto: CreateBlogDto): Promise<Blog> {
    return this.blogService.create(createDto);
  }

  @Get()
  async findAll(@Query('userId') userId?: string): Promise<any[]> {
    const blogs = await this.blogService.findAllForUser(userId);
    return blogs.map((b) => ({
      ...b,
      likesCount: (b.likedBy || []).length,
      likedBy: (b.likedBy || []).map((u: any) => u.name),
    }));
  } // all blogs xuttai banaune, if no userid is given

  @Get('active')
  async findActive(@Query('userId') userId?: string): Promise<any[]> {
    const blogs = await this.blogService.findActiveForUser(userId);
    return blogs.map((b) => ({
      ...b,
      likesCount: (b.likedBy || []).length,
      likedBy: (b.likedBy || []).map((u: any) => u.name),
    }));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateBlogDto): Promise<Blog> {
    return this.blogService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.blogService.remove(id);
    return { message: 'Blog deleted successfully' };
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @Query('userId') userId: string): Promise<any> {
    const blog = await this.blogService.like(id, userId);
    return {
      ...blog,
      likesCount: (blog.likedBy || []).length,
      likedBy: (blog.likedBy || []).map((u: any) => u.name),
    };
  }

  @Delete(':id/like')
  async unlike(@Param('id') id: string, @Query('userId') userId: string): Promise<any> {
    const blog = await this.blogService.unlike(id, userId);
    return {
      ...blog,
      likesCount: (blog.likedBy || []).length,
      likedBy: (blog.likedBy || []).map((u: any) => u.name),
    };
  }
}


