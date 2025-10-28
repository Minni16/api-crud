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
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateBlogDto): Promise<Blog> {
    const status = createDto.status ?? BlogStatus.ACTIVE;
    const result = await this.blogRepository
      .createQueryBuilder()
      .insert()
      .into(Blog)
      .values([{ ...createDto, status, authorId: createDto.authorId }])
      .returning('*') // returns full row
      .execute();
    return result.raw[0] as Blog; // vakkhar insert gareko dekhauxa
  }

  async findAllForUser(user: User): Promise<Blog[]> {
    const qb = this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.likedBy', 'likedBy')
      .leftJoinAndSelect('b.author', 'author')
      .orderBy('b.title', 'ASC');

    if (user.role !== UserRole.ADMIN) {
      qb.where('b.authorId = :authorId', { authorId: user.id });
    }

    return await qb.getMany();
  } // blog list

  async findActiveForUser(user: User): Promise<Blog[]> {
    const qb = this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.likedBy', 'likedBy')
      .leftJoinAndSelect('b.author', 'author')
      .where('b.status = :status', { status: BlogStatus.ACTIVE })
      .orderBy('b.title', 'ASC');

    if (user.role !== UserRole.ADMIN) {
      qb.andWhere('b.authorId = :authorId', { authorId: user.id });
    }

    return await qb.getMany();
  }

  async update(id: string, updateDto: UpdateBlogDto): Promise<Blog> {
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
  }

  async remove(id: string): Promise<void> {
    const res = await this.blogRepository
      .createQueryBuilder()
      .delete()
      .from(Blog)
      .where('id = :id', { id })
      .execute();
    if (!res.affected) {
      throw new NotFoundException('Blog not found');
    }
  }

  async like(blogId: string, userId: string): Promise<Blog> {
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
      .add(userId);

    const updated = await this.blogRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.likedBy', 'likedBy')
      .leftJoinAndSelect('b.author', 'author')
      .where('b.id = :id', { id: blogId })
      .getOne();
    if (!updated) throw new NotFoundException('Blog not found');
    return updated;
  }

  async unlike(blogId: string, userId: string): Promise<Blog> {
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
      .leftJoinAndSelect('b.likedBy', 'likedBy')
      .leftJoinAndSelect('b.author', 'author')
      .where('b.id = :id', { id: blogId })
      .getOne();
    if (!updated) throw new NotFoundException('Blog not found');
    return updated;
  }
}
