import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private readonly logger = new Logger(S3Service.name);

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('AWS_REGION');
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'tingletalk-uploads');

        if (!region || !accessKeyId || !secretAccessKey) {
            this.logger.warn('AWS credentials not found. S3 uploads will fail.');
        }

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId: accessKeyId || '',
                secretAccessKey: secretAccessKey || '',
            },
        });
    }

    async generatePresignedUrl(
        fileType: string,
        contentType: string,
    ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
        try {
            // Validate inputs could happen here, but controller should handle basic DTO validation.

            const fileExtension = fileType.split('/')[1] || 'bin';
            const key = `uploads/${randomUUID()}.${fileExtension}`;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
                // ACL: 'public-read', // Optional: Depends on bucket policy. Usually better to keep private and use CloudFront, but for this demo public-read or bucket policy is fine.
                // If the bucket is not public, we would need CloudFront or presigned GET urls. 
                // Assuming user will configure bucket to be public-read for 'uploads/' or use a policy.
            });

            const uploadUrl = await getSignedUrl(this.s3Client, command, {
                expiresIn: 300, // 5 minutes
            });

            // Construct public URL. 
            // Ideally this should use a CDN domain if configured, otherwise S3 domain.
            const publicUrl = `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;

            return { uploadUrl, publicUrl, key };
        } catch (error) {
            this.logger.error('Error generating presigned URL', error);
            throw new InternalServerErrorException('Failed to generate upload URL');
        }
    }
}
