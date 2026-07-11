import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProfileRequestDto {
  @ApiPropertyOptional({
    description: 'User username',
    example: 'john.doe',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Whether user should be pinged',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  shouldPing?: boolean;

  @ApiPropertyOptional({
    description: 'Whether user should be notified by email',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  notifyEmail?: boolean;
}

export class UpdateSubscriptionRequestDto {
  @ApiProperty({
    description: 'Whether to recharge the subscription',
    example: true,
  })
  @IsBoolean()
  recharge: boolean;
}
