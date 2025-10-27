import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum BlogStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity({ name: 'blogs' })
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: BlogStatus, default: BlogStatus.ACTIVE })
  status: BlogStatus;

  @Column({ type: 'uuid', nullable: true })
  authorId: string | null;

  @ManyToOne(() => User, (user) => user.blogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorId' })
  author: User | null;
}


