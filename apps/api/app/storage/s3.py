"""S3/MinIO storage adapter."""

import os
from dataclasses import dataclass
from functools import lru_cache

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError


@dataclass
class ObjectInfo:
    """Information about an object in storage."""

    size_bytes: int
    content_type: str
    etag: str | None = None


class S3Storage:
    """S3-compatible storage adapter (works with MinIO and AWS S3)."""

    def __init__(
        self,
        endpoint_url: str | None = None,
        access_key: str | None = None,
        secret_key: str | None = None,
        bucket: str | None = None,
        region: str = "us-east-1",
        public_base_url: str | None = None,
        public_endpoint_url: str | None = None,
    ):
        self.endpoint_url = endpoint_url or os.getenv("S3_ENDPOINT_URL")
        self.access_key = access_key or os.getenv("S3_ACCESS_KEY")
        self.secret_key = secret_key or os.getenv("S3_SECRET_KEY")
        self.bucket = bucket or os.getenv("S3_BUCKET", "phoenix")
        self.region = region or os.getenv("S3_REGION", "us-east-1")
        self.public_base_url = public_base_url or os.getenv("S3_PUBLIC_BASE_URL")
        self.public_endpoint_url = public_endpoint_url or os.getenv("S3_PUBLIC_ENDPOINT_URL", "http://localhost:9000")

        self._client = boto3.client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
            config=Config(signature_version="s3v4"),
        )

        self._public_client = boto3.client(
            "s3",
            endpoint_url=self.public_endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region,
            config=Config(signature_version="s3v4"),
        )

    def generate_presigned_put_url(
        self,
        object_key: str,
        content_type: str,
        content_length: int,
        expires_in: int = 3600,
    ) -> str:
        """Generate a presigned URL for uploading an object (uses public endpoint for browser access)."""
        url = self._public_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.bucket,
                "Key": object_key,
                "ContentType": content_type,
                "ContentLength": content_length,
            },
            ExpiresIn=expires_in,
        )
        return url

    def head_object(self, object_key: str) -> ObjectInfo | None:
        """Get object metadata. Returns None if object doesn't exist."""
        try:
            response = self._client.head_object(
                Bucket=self.bucket,
                Key=object_key,
            )
            return ObjectInfo(
                size_bytes=response["ContentLength"],
                content_type=response.get("ContentType", "application/octet-stream"),
                etag=response.get("ETag"),
            )
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return None
            raise

    def delete_object(self, object_key: str) -> bool:
        """Delete an object from storage. Returns True if successful."""
        try:
            self._client.delete_object(
                Bucket=self.bucket,
                Key=object_key,
            )
            return True
        except ClientError:
            return False

    def get_public_url(self, object_key: str) -> str:
        """Get the public URL for an object (uses public endpoint for browser access)."""
        if self.public_base_url:
            return f"{self.public_base_url.rstrip('/')}/{object_key}"
        if self.public_endpoint_url:
            return f"{self.public_endpoint_url.rstrip('/')}/{self.bucket}/{object_key}"
        if self.endpoint_url:
            return f"{self.endpoint_url.rstrip('/')}/{self.bucket}/{object_key}"
        return f"https://{self.bucket}.s3.{self.region}.amazonaws.com/{object_key}"

    def ensure_bucket_exists(self) -> None:
        """Create bucket if it doesn't exist (useful for dev/MinIO)."""
        try:
            self._client.head_bucket(Bucket=self.bucket)
        except ClientError:
            self._client.create_bucket(Bucket=self.bucket)

    def upload_fileobj(
        self,
        file_obj,
        object_key: str,
        content_type: str,
    ) -> bool:
        """Upload a file object to storage."""
        try:
            self._client.upload_fileobj(
                file_obj,
                self.bucket,
                object_key,
                ExtraArgs={"ContentType": content_type},
            )
            return True
        except ClientError:
            return False


@lru_cache
def get_storage() -> S3Storage:
    """Get singleton storage instance."""
    return S3Storage()
