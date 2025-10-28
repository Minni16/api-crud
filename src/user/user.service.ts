import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateUserDto): Promise<User> {
    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([createDto])
        .returning('*')
        .execute();
      return result.raw[0] as User;
    } catch (e) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository
        .createQueryBuilder('u')
        .orderBy('u.name', 'ASC')
        .getMany();
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('u')
        .where('u.id = :id', { id })
        .getOne();
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findActive(): Promise<User[]> {
    try {
      return await this.userRepository
        .createQueryBuilder('u')
        .where('u.status = :status', { status: UserStatus.ACTIVE })
        .orderBy('u.name', 'ASC')
        .getMany();
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch active users');
    }
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<User> {
    try {
      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ ...updateDto })
        .where('id = :id', { id })
        .returning('*')
        .execute();
      if (!result.affected) throw new NotFoundException('User not found');
      return result.raw[0] as User;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Ensure user exists and fetch liked blogs to clear relations first
      const userWithLikes = await this.userRepository
        .createQueryBuilder('u')
        .leftJoin('u.blogsLiked', 'b')
        .addSelect(['b.id'])
        .where('u.id = :id', { id })
        .getOne();
      if (!userWithLikes) throw new NotFoundException('User not found');

      const likedBlogIds = (userWithLikes.blogsLiked || []).map((b: any) => b.id);
      if (likedBlogIds.length) {
        await this.userRepository
          .createQueryBuilder()
          .relation(User, 'blogsLiked')
          .of(id)
          .remove(likedBlogIds);
      }

      const res = await this.userRepository
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('id = :id', { id })
        .execute();
      if (!res.affected) throw new NotFoundException('User not found');
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException('Failed to remove user');
    }
  }
}


