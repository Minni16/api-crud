import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateBlogDto): Promise<Blog> {
    try {
      const status = createDto.status ?? BlogStatus.ACTIVE;
      const result = await this.blogRepository
        .createQueryBuilder()
        .insert()
        .into(Blog)
        .values([{ ...createDto, status, authorId: createDto.authorId }])
        .returning('*')
        .execute();
      return result.raw[0] as Blog;
    } catch (e) {
      throw new InternalServerErrorException('Failed to create blog');
    }
  }

  async findAllForUser(userId?: string): Promise<Blog[]> {
    try {
      const qb = this.blogRepository
        .createQueryBuilder('b')
        .leftJoin('b.likedBy', 'likedBy')
        .addSelect(['likedBy.id', 'likedBy.name'])
        .leftJoin('b.author', 'author')
        .addSelect(['author.name'])
        .orderBy('b.title', 'ASC');

      if (userId) {
        const user = await this.userRepository
          .createQueryBuilder('u')
          .where('u.id = :id', { id: userId })
          .getOne();
        if (!user) throw new NotFoundException('User not found');
        if (user.role !== UserRole.ADMIN) {
          qb.where('b.authorId = :authorId', { authorId: user.id });
        }
      }

      return await qb.getMany();
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to fetch blogs');
    }
  } // blog list

  async findActiveForUser(userId?: string): Promise<Blog[]> {
    try {
      const qb = this.blogRepository
        .createQueryBuilder('b')
        .leftJoin('b.likedBy', 'likedBy')
        .addSelect(['likedBy.id', 'likedBy.name'])
        .leftJoin('b.author', 'author')
        .addSelect(['author.name'])
        .where('b.status = :status', { status: BlogStatus.ACTIVE })
        .orderBy('b.title', 'ASC');

      if (userId) {
        const user = await this.userRepository
          .createQueryBuilder('u')
          .where('u.id = :id', { id: userId })
          .getOne();
        if (!user) throw new NotFoundException('User not found');
        if (user.role !== UserRole.ADMIN) {
          qb.andWhere('b.authorId = :authorId', { authorId: user.id });
        }
      }

      return await qb.getMany();
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to fetch active blogs');
    }
  }

  async update(id: string, updateDto: UpdateBlogDto): Promise<Blog> {
    try {
      const result = await this.blogRepository
        .createQueryBuilder()
        .update(Blog)
        .set({ ...updateDto })
        .where('id = :id', { id })
        .returning('*')
        .execute();

      if (!result.affected) {
        throw new NotFoundException('Blog not found');
      }

      return result.raw[0] as Blog;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to update blog');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const res = await this.blogRepository
        .createQueryBuilder()
        .delete()
        .from(Blog)
        .where('id = :id', { id })
        .execute();
      if (!res.affected) {
        throw new NotFoundException('Blog not found');
      }
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to remove blog');
    }
  }

  async like(blogId: string, userId: string): Promise<Blog> {
    try {
      const blog = await this.blogRepository
        .createQueryBuilder('b')
        .where('b.id = :id', { id: blogId })
        .getOne();
      if (!blog) throw new NotFoundException('Blog not found');

      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.id = :id', { id: userId })
        .getOne();
      if (!user) throw new NotFoundException('User not found');

      if (blog.authorId && blog.authorId === userId) {
        throw new BadRequestException("You can't like your own blog");
      }

      await this.blogRepository
        .createQueryBuilder()
        .relation(Blog, 'likedBy')
        .of(blogId)
        .add(userId);

      const updated = await this.blogRepository
        .createQueryBuilder('b')
        .leftJoin('b.likedBy', 'likedBy')
        .addSelect(['likedBy.id', 'likedBy.name'])
        .leftJoin('b.author', 'author')
        .addSelect(['author.name'])
        .where('b.id = :id', { id: blogId })
        .getOne();
      if (!updated) throw new NotFoundException('Blog not found');
      return updated;
    } catch (e) {
      if (e instanceof NotFoundException || e instanceof BadRequestException) throw e;
      throw new InternalServerErrorException('Failed to like blog');
    }
  }

  async unlike(blogId: string, userId: string): Promise<Blog> {
    try {
      const blogExists = await this.blogRepository
        .createQueryBuilder('b')
        .where('b.id = :id', { id: blogId })
        .getExists();
      if (!blogExists) throw new NotFoundException('Blog not found');

      const userExists = await this.userRepository
        .createQueryBuilder('u')
        .where('u.id = :id', { id: userId })
        .getExists();
      if (!userExists) throw new NotFoundException('User not found');

      await this.blogRepository
        .createQueryBuilder()
        .relation(Blog, 'likedBy')
        .of(blogId)
        .remove(userId);

      const updated = await this.blogRepository
        .createQueryBuilder('b')
        .leftJoin('b.likedBy', 'likedBy')
        .addSelect(['likedBy.id', 'likedBy.name'])
        .leftJoin('b.author', 'author')
        .addSelect(['author.name'])
        .where('b.id = :id', { id: blogId })
        .getOne();
      if (!updated) throw new NotFoundException('Blog not found');
      return updated;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to unlike blog');
    }
  }
}
