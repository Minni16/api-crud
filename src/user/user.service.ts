import { Injectable, NotFoundException } from '@nestjs/common';
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
    const result = await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([createDto])
      .returning('*')
      .execute();
    return result.raw[0] as User;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('u')
      .orderBy('u.name', 'ASC')
      .getMany();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where('u.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findActive(): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('u')
      .where('u.status = :status', { status: UserStatus.ACTIVE })
      .orderBy('u.name', 'ASC')
      .getMany();
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<User> {
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ ...updateDto })
      .where('id = :id', { id })
      .returning('*')
      .execute();
    if (!result.affected) throw new NotFoundException('User not found');
    return result.raw[0] as User;
  }

  async remove(id: string): Promise<void> {
    const res = await this.userRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :id', { id })
      .execute();
    if (!res.affected) throw new NotFoundException('User not found');
  }
}


