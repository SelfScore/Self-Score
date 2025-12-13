# S3 Migration Guide - Consultant File Uploads

## ✅ Changes Completed

### 1. **AWS SDK Installation**

- Installed `@aws-sdk/client-s3` package in server
- Version: Latest AWS SDK v3

### 2. **New S3 Utility Library**

**File**: `server/src/lib/s3.ts`

**Features**:

- Upload files from base64 to S3
- Delete files from S3
- Dedicated functions for profile photos, resumes, and certificates
- Automatic file type detection from base64
- Unique filename generation with timestamps
- Public-read ACL for all files

**S3 Folder Structure**:

```
selfscore-storage/
├── profile-photos/
│   └── profile-{consultantId}-{timestamp}.{ext}
├── resumes/
│   └── resume-{consultantId}-{timestamp}.{ext}
└── certificates/
    └── cert-{consultantId}-{certName}-{timestamp}.{ext}
```

### 3. **Environment Variables Added**

**File**: `server/.env`

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=selfscore-storage
```

### 4. **Database Schema Updated**

**File**: `server/src/models/consultant.ts`

**Changes**:

- Removed base64 validation from `profilePhoto`, `resume`, and `certificateFile` fields
- These fields now store S3 URLs instead of base64 strings
- No size limits needed (S3 handles storage)

### 5. **Controllers Updated**

#### Step 1 Controller (Profile Photo)

**File**: `server/src/controllers/consultantAuth.controller.ts`

- Imports S3 upload functions
- Uploads profile photo to S3 before saving consultant
- Returns error if S3 upload fails
- Stores S3 URL in database

#### Step 3 Controller (Resume & Certificates)

**File**: `server/src/controllers/consultantAuth.controller.ts`

- Uploads resume to S3 (required)
- Uploads each certificate file to S3 (if provided)
- Returns error if any upload fails
- Stores S3 URLs in database

---

## 🔧 Required Actions

### 1. **Set Up AWS S3 Bucket**

#### Step 1: Create S3 Bucket

1. Log in to AWS Console
2. Go to S3 service
3. Click "Create bucket"
4. Bucket name: `selfscore-storage`
5. Region: `us-east-1` (US East - N. Virginia)
6. **Uncheck** "Block all public access" (we need public read access)
7. Acknowledge the warning
8. Click "Create bucket"

#### Step 2: Configure Bucket Policy for Public Read

1. Go to your bucket → Permissions tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::selfscore-storage/*"
    }
  ]
}
```

5. Click "Save changes"

#### Step 3: Create IAM User with S3 Access

1. Go to IAM service
2. Click "Users" → "Add users"
3. User name: `selfscore-s3-uploader`
4. Access type: "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Select `AmazonS3FullAccess` (or create custom policy with only PutObject/DeleteObject permissions)
8. Click through to "Create user"
9. **IMPORTANT**: Copy the Access Key ID and Secret Access Key

#### Step 4: Update Environment Variables

Update `server/.env` with your actual AWS credentials:

```bash
AWS_ACCESS_KEY_ID=AKIA... (your actual key)
AWS_SECRET_ACCESS_KEY=wJalr... (your actual secret)
AWS_REGION=us-east-1
AWS_BUCKET_NAME=selfscore-storage
```

### 2. **Restart Server**

After updating `.env`, restart your server:

```bash
cd server
npm run dev
```

---

## 🧪 Testing

### Test Step 1 - Profile Photo Upload

1. Go to consultant registration
2. Upload a profile photo (any image)
3. Complete Step 1
4. Check S3 bucket → `profile-photos/` folder should have the image
5. Verify database has S3 URL instead of base64

### Test Step 3 - Resume & Certificates

1. Continue to Step 3
2. Upload resume (PDF or image)
3. Add certifications with certificate files
4. Complete Step 3
5. Check S3 bucket:
   - `resumes/` folder should have the resume
   - `certificates/` folder should have certificate files
6. Verify database has S3 URLs

### Test Error Handling

1. Try registering with invalid AWS credentials (temporarily)
2. Should see error: "Failed to upload profile photo. Please try again."
3. Fix credentials and try again

---

## 📝 Technical Details

### File Upload Flow

**Before (Base64)**:

```
Client → Base64 → Server → MongoDB (Base64 string)
```

**After (S3)**:

```
Client → Base64 → Server → S3 Upload → MongoDB (S3 URL)
```

### File Access

**URL Format**:

```
https://selfscore-storage.s3.us-east-1.amazonaws.com/profile-photos/profile-123-1234567890.jpg
```

**Access**: Publicly readable (anyone with URL can view)

### Error Handling

If S3 upload fails at any step:

- Error returned to user immediately
- Database operation is NOT performed
- User can retry the upload
- No partial data saved

---

## 🔒 Security Considerations

### Current Setup (Public Read)

- ✅ Simple URL access
- ✅ Good for profile photos on public pages
- ⚠️ Anyone with URL can access files
- ⚠️ Files are not deleted when consultant is removed

### Optional Enhancements (Future)

1. **Presigned URLs** (Private files with temporary access):

```typescript
// Would require changes to generate URLs on-demand
const url = await generatePresignedUrl(s3Key, 3600); // 1 hour expiry
```

2. **CloudFront CDN** (Better performance):

- Add CloudFront distribution
- Cache files globally
- Faster downloads

3. **File Deletion** (Cleanup):

- Delete S3 files when consultant is deleted
- Delete old files when consultant updates

---

## 🐛 Troubleshooting

### Issue: "Failed to upload file to S3"

**Possible Causes**:

1. Invalid AWS credentials
2. Bucket doesn't exist
3. Wrong region
4. IAM user lacks permissions
5. Network issues

**Solutions**:

1. Verify credentials in `.env`
2. Check bucket name is exactly `selfscore-storage`
3. Verify region is `us-east-1`
4. Check IAM user has S3 permissions
5. Check server logs for detailed error

### Issue: "Access Denied" when viewing file URL

**Causes**:

- Bucket policy not configured for public read

**Solution**:

- Add bucket policy from Step 2 above

### Issue: Files not appearing in S3

**Causes**:

- Upload succeeded but to wrong bucket/region
- Folder names don't match

**Solution**:

- Check S3 console for files
- Verify folder names: `profile-photos`, `resumes`, `certificates`
- Check server logs for S3 responses

---

## 📊 Migration Notes

### Existing Consultants

- **Old consultants** with base64 data will continue to work
- Their URLs start with `data:image/...` or `data:application/...`
- **New consultants** will have S3 URLs starting with `https://selfscore-storage.s3...`
- No migration script created (as per your request)

### Frontend Compatibility

- No changes needed on frontend
- Still sends base64 strings to server
- Server handles S3 upload transparently
- Database receives S3 URL instead of base64

---

## 📈 Benefits of S3 Storage

1. **Reduced Database Size**: Files no longer stored in MongoDB
2. **Better Performance**: MongoDB queries faster without large base64 strings
3. **Scalability**: S3 can handle unlimited files
4. **Cost Effective**: S3 storage is cheaper than database storage
5. **CDN Ready**: Can easily add CloudFront for global delivery
6. **Backup**: S3 has built-in versioning and backup options

---

## 🎯 Next Steps

1. ✅ Create S3 bucket
2. ✅ Configure bucket policy
3. ✅ Create IAM user
4. ✅ Update `.env` file
5. ✅ Restart server
6. ✅ Test file uploads
7. ✅ Monitor S3 usage in AWS console

---

## 📞 Support

If you encounter any issues:

1. Check server logs for detailed errors
2. Verify AWS credentials and permissions
3. Ensure bucket policy is correct
4. Check S3 console for uploaded files

---

**Migration completed successfully! 🎉**
