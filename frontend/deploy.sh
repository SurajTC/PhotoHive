#!/bin/bash

set -e  # Exit on error
set -o pipefail  # Exit on pipeline failure

# Replace these variables with your own values
BUCKET_NAME="photohive"
REGION="us-east-1"
BUILD_DIR="dist"

# Check if the bucket already exists
if aws s3api head-bucket --bucket "${BUCKET_NAME}" 2>/dev/null; then
    echo "S3 bucket '${BUCKET_NAME}' already exists."
else
    # Create S3 bucket
    echo "Creating S3 bucket..."
    aws s3api create-bucket --bucket "${BUCKET_NAME}" --region "${REGION}"
    aws s3api put-public-access-block \
    --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
    aws s3api put-bucket-policy --bucket "${BUCKET_NAME}" --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
            \"Sid\": \"PublicReadGetObject\",
            \"Effect\": \"Allow\",
            \"Principal\": \"*\",
            \"Action\": \"s3:GetObject\",
            \"Resource\": \"arn:aws:s3:::${BUCKET_NAME}/*\"
            }
        ]
    }"
    echo "S3 bucket created successfully."
fi

# Build React app
echo "Building React app..."
npm run build

# Upload React app to S3
echo "Uploading React app to S3..."
aws s3 sync "${BUILD_DIR}/" "s3://${BUCKET_NAME}/"

# Configure S3 for static website hosting
echo "Configuring S3 for static website hosting..."
aws s3 website "s3://${BUCKET_NAME}/" --index-document index.html --error-document index.html

# Output success message
echo "React app deployed successfully to S3: http://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com/"
