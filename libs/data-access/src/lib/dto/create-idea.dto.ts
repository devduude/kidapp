import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateIdeaDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  votes?: number;
}
