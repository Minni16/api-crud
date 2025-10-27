import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from './blog.entity';
import { User, UserRole } from '../user/user.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(createDto: CreateBlogDto): Promise<Blog> {
    const status = createDto.status ?? BlogStatus.ACTIVE;
    const blog = this.blogRepository.create({ ...createDto, status, authorId: createDto.authorId });
    return await this.blogRepository.save(blog);
  }

  async findAllForUser(user: User): Promise<Blog[]> {
    if (user.role === UserRole.ADMIN) {
      return await this.blogRepository.find({ order: { title: 'ASC' } });
    }
    return await this.blogRepository.find({ where: { authorId: user.id }, order: { title: 'ASC' } });
  }

  async findActiveForUser(user: User): Promise<Blog[]> {
    if (user.role === UserRole.ADMIN) {
      return await this.blogRepository.find({ where: { status: BlogStatus.ACTIVE }, order: { title: 'ASC' } });
    }
    return await this.blogRepository.find({ where: { status: BlogStatus.ACTIVE, authorId: user.id }, order: { title: 'ASC' } });
  }

  async update(id: string, updateDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    
    Object.assign(blog, updateDto);
    return await this.blogRepository.save(blog);
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogRepository.delete({ id });
    if (!result.affected) {
      throw new NotFoundException('Blog not found');
    }
  }
}
