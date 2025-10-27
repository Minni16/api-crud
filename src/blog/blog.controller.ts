import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Blog } from './blog.entity';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UserService } from '../user/user.service';

// baset route for blogs
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService, private readonly userService: UserService) {}

  @Post()
  create(@Body() createDto: CreateBlogDto): Promise<Blog> {
    return this.blogService.create(createDto);
  }

  @Get()
  async findAll(@Query('userId') userId: string): Promise<Blog[]> {
    const user = await this.userService.findById(userId);
    return this.blogService.findAllForUser(user);
  }

  @Get('active')
  async findActive(@Query('userId') userId: string): Promise<Blog[]> {
    const user = await this.userService.findById(userId);
    return this.blogService.findActiveForUser(user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateBlogDto): Promise<Blog> {
    return this.blogService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.blogService.remove(id);
  }
}


