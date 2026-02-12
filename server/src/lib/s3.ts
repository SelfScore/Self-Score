import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'selfscore-storage';

// Folder names in S3
export const S3_FOLDERS = {
    PROFILE_PHOTOS: 'profile-photos',
    RESUMES: 'resumes',
    CERTIFICATES: 'certificates',
} as const;

/**
 * Extract file extension from base64 string
 */
const getFileExtensionFromBase64 = (base64String: string): string => {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,/);
    if (matches && matches[1]) {
        const mimeType = matches[1];
        const ext = mimeType.split('/')[1];
        // Handle special cases
        if (ext === 'jpeg') return 'jpg';
        if (ext === 'svg+xml') return 'svg';
        return ext;
    }
    return 'bin'; // fallback
};

/**
 * Convert base64 string to Buffer
 */
const base64ToBuffer = (base64String: string): Buffer => {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:[A-Za-z-+\/]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
};

/**
 * Get content type from base64 string
 */
const getContentTypeFromBase64 = (base64String: string): string => {
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,/);
    if (matches && matches[1]) {
        return matches[1];
    }
    return 'application/octet-stream'; // fallback
};

/**
 * Upload a file to S3 from base64 string
 * @param base64String - The base64 encoded file string
 * @param folder - The folder in S3 (profile-photos, resumes, certificates)
 * @param fileName - Optional custom file name (without extension)
 * @returns The public URL of the uploaded file
 */
export const uploadToS3 = async (
    base64String: string,
    folder: keyof typeof S3_FOLDERS,
    fileName?: string
): Promise<string> => {
    try {
        // Validate base64 string
        if (!base64String || !base64String.startsWith('data:')) {
            throw new Error('Invalid base64 string');
        }

        // Generate unique filename if not provided
        const extension = getFileExtensionFromBase64(base64String);
        const uniqueFileName = fileName ? `${fileName}.${extension}` : `${uuidv4()}.${extension}`;
        const key = `${S3_FOLDERS[folder]}/${uniqueFileName}`;

        // Convert base64 to buffer
        const fileBuffer = base64ToBuffer(base64String);
        const contentType = getContentTypeFromBase64(base64String);

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            // Note: ACL removed - using bucket-level public access policy instead
        });

        await s3Client.send(command);

        // Return public URL
        const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
        return publicUrl;

    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Failed to upload file to S3');
    }
};

/**
 * Delete a file from S3 using its URL
 * @param fileUrl - The full S3 URL of the file
 * @returns True if successful
 */
export const deleteFromS3 = async (fileUrl: string): Promise<boolean> => {
    try {
        // Extract key from URL
        // URL format: https://bucket-name.s3.region.amazonaws.com/folder/filename.ext
        const urlParts = fileUrl.split('.amazonaws.com/');
        if (urlParts.length < 2) {
            throw new Error('Invalid S3 URL format');
        }

        const key = urlParts[1];

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
        console.log(`✅ Deleted file from S3: ${key}`);
        return true;

    } catch (error) {
        console.error('Error deleting from S3:', error);
        return false;
    }
};

/**
 * Upload profile photo to S3
 * @param base64String - Base64 encoded image
 * @param consultantId - Consultant's MongoDB ID
 * @returns Public S3 URL
 */
export const uploadProfilePhoto = async (
    base64String: string,
    consultantId: string
): Promise<string> => {
    const fileName = `profile-${consultantId}-${Date.now()}`;
    return uploadToS3(base64String, 'PROFILE_PHOTOS', fileName);
};

/**
 * Upload resume to S3
 * @param base64String - Base64 encoded resume file
 * @param consultantId - Consultant's MongoDB ID
 * @returns Public S3 URL
 */
export const uploadResume = async (
    base64String: string,
    consultantId: string
): Promise<string> => {
    const fileName = `resume-${consultantId}-${Date.now()}`;
    return uploadToS3(base64String, 'RESUMES', fileName);
};

/**
 * Upload certificate to S3
 * @param base64String - Base64 encoded certificate file
 * @param consultantId - Consultant's MongoDB ID
 * @param certificationName - Name of the certification
 * @returns Public S3 URL
 */
export const uploadCertificate = async (
    base64String: string,
    consultantId: string,
    certificationName: string
): Promise<string> => {
    // Sanitize certification name for filename
    const sanitizedName = certificationName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const fileName = `cert-${consultantId}-${sanitizedName}-${Date.now()}`;
    return uploadToS3(base64String, 'CERTIFICATES', fileName);
};

export default s3Client;
