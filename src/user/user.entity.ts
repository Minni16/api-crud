import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToMany } from 'typeorm'; // added manytomany
import { Blog } from '../blog/blog.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @OneToMany(() => Blog, (blog) => (blog as any).author)
  blogs: Blog[];

  // Many-to-Many relationship with Blog for likes
  @ManyToMany(() => Blog, (blog) => blog.likedBy)
  blogsLiked: Blog[];
}


