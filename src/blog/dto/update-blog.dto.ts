import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BlogStatus } from '../blog.entity';

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsUUID()
  authorId?: string;
}
