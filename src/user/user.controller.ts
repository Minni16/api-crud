import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createDto: CreateUserDto): Promise<User> {
    return this.userService.create(createDto);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('active')
  findActive(): Promise<User[]> {
    return this.userService.findActive();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUserDto): Promise<User> {
    return this.userService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }
}


