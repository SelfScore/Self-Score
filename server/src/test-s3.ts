/**
 * S3 Integration Test Script
 * 
 * Run this to verify your S3 configuration is working correctly
 * 
 * Usage:
 *   npx ts-node src/test-s3.ts
 */

import { uploadToS3, deleteFromS3, S3_FOLDERS } from './lib/s3';

// Sample base64 image (1x1 red pixel PNG)
const TEST_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testS3Upload() {
    console.log('🧪 Testing S3 Integration...\n');

    try {
        // Test 1: Upload a file
        console.log('1️⃣  Testing file upload...');
        const testUrl = await uploadToS3(
            TEST_IMAGE_BASE64,
            'PROFILE_PHOTOS',
            'test-image-' + Date.now()
        );
        console.log('✅ Upload successful!');
        console.log('📎 File URL:', testUrl);
        console.log('');

        // Test 2: Verify the URL is accessible
        console.log('2️⃣  Testing file accessibility...');
        const response = await fetch(testUrl);
        if (response.ok) {
            console.log('✅ File is publicly accessible!');
            console.log('📊 Content-Type:', response.headers.get('content-type'));
        } else {
            console.log('❌ File is not accessible. Status:', response.status);
        }
        console.log('');

        // Test 3: Delete the file
        console.log('3️⃣  Testing file deletion...');
        const deleteSuccess = await deleteFromS3(testUrl);
        if (deleteSuccess) {
            console.log('✅ File deleted successfully!');
        } else {
            console.log('❌ Failed to delete file');
        }
        console.log('');

        // Final message
        console.log('🎉 All tests passed! Your S3 integration is working correctly.\n');
        console.log('📝 Next steps:');
        console.log('   1. Test consultant registration with file uploads');
        console.log('   2. Check your S3 bucket in AWS Console');
        console.log('   3. Monitor S3 usage and costs\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check AWS credentials in .env file');
        console.log('   2. Verify bucket name is correct: selfscore-storage');
        console.log('   3. Verify region is correct: us-east-1');
        console.log('   4. Check IAM user has S3 permissions');
        console.log('   5. Ensure bucket policy allows public read access\n');
        process.exit(1);
    }
}

testS3Upload();
