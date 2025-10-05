import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRandomIdeasDto {
  @ApiProperty({ 
    required: false, 
    minimum: 1, 
    maximum: 100, 
    default: 16,
    description: 'Number of random ideas to return'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 16;
}
