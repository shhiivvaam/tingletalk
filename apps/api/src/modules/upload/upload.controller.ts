import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { S3Service } from './s3.service';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

// Simple DTO
class PresignedUrlDto {
    @IsString()
    @IsNotEmpty()
    fileType: string; // e.g., 'image/png'

    @IsString()
    @IsNotEmpty()
    contentType: string; // e.g., 'image/png'

    @IsNumber()
    @IsOptional()
    fileSize?: number; // Size in bytes
}

const MAX_SIZES = {
    image: 50 * 1024 * 1024, // 50MB (Accommodate high-res camera photos)
    video: 100 * 1024 * 1024, // 100MB (Accommodate 1 min videos)
    audio: 50 * 1024 * 1024, // 50MB
};

@Controller('upload')
@UseGuards(ThrottlerGuard)
export class UploadController {
    constructor(private readonly s3Service: S3Service) { }

    @Post('presigned')
    @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 uploads per 5 minutes
    async getPresignedUrl(@Body() dto: PresignedUrlDto) {
        if (dto.fileSize) {
            const type = dto.fileType.split('/')[0] as keyof typeof MAX_SIZES; // 'image', 'video', 'audio'
            const limit = MAX_SIZES[type] || 50 * 1024 * 1024;

            if (dto.fileSize > limit) {
                throw new BadRequestException(`File size exceeds server limit for ${type} (Limit: ${limit / (1024 * 1024)}MB)`);
            }
        }

        return this.s3Service.generatePresignedUrl(dto.fileType, dto.contentType);
    }
}
