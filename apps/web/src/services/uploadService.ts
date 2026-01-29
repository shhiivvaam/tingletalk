const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PresignedResponse {
    uploadUrl: string;
    publicUrl: string;
    key: string;
}

export const UploadService = {
    async getPresignedUrl(fileType: string, fileSize: number): Promise<PresignedResponse> {
        const response = await fetch(`${API_URL}/upload/presigned`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileType,
                contentType: fileType,
                fileSize,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get upload URL');
        }

        return response.json();
    },

    async uploadFile(file: File): Promise<string> {
        try {
            // 0. Client side Size Check (Optional, but good for UX)
            const MAX_SIZES = {
                'image': 10 * 1024 * 1024,
                'video': 50 * 1024 * 1024,
                'audio': 20 * 1024 * 1024,
            } as const;

            const type = file.type.split('/')[0] as keyof typeof MAX_SIZES;
            const limit = MAX_SIZES[type] || MAX_SIZES['image'];

            if (file.size > limit) {
                throw new Error(`File too large. Max size is ${limit / (1024 * 1024)}MB`);
            }

            // 1. Get Presigned URL
            const { uploadUrl, publicUrl } = await this.getPresignedUrl(file.type, file.size);

            // 2. Upload to S3 directly
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file to storage');
            }

            return publicUrl;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }
};
