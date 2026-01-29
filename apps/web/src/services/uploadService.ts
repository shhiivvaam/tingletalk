const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PresignedResponse {
    uploadUrl: string;
    publicUrl: string;
    key: string;
}

export const UploadService = {
    async getPresignedUrl(fileType: string): Promise<PresignedResponse> {
        const response = await fetch(`${API_URL}/upload/presigned`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileType,
                contentType: fileType,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get upload URL');
        }

        return response.json();
    },

    async uploadFile(file: File): Promise<string> {
        try {
            // 1. Get Presigned URL
            const { uploadUrl, publicUrl } = await this.getPresignedUrl(file.type);

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
