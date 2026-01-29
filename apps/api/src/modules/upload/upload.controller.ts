import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service';
import { IsString, IsNotEmpty } from 'class-validator';

// Simple DTO
class PresignedUrlDto {
    @IsString()
    @IsNotEmpty()
    fileType: string; // e.g., 'image/png'

    @IsString()
    @IsNotEmpty()
    contentType: string; // e.g., 'image/png'
}

@Controller('upload')
export class UploadController {
    constructor(private readonly s3Service: S3Service) { }

    @Post('presigned')
    async getPresignedUrl(@Body() dto: PresignedUrlDto) {
        return this.s3Service.generatePresignedUrl(dto.fileType, dto.contentType);
    }
}
