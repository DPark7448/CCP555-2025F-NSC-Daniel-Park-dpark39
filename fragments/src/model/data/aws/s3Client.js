// src/model/data/aws/s3Client.js

/**
 * S3 specific config and objects.
 */
const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

/**
 * If AWS credentials are configured in the environment, use them.
 * Needed when testing locally / LocalStack / MinIO.
 */
const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    };
    logger.debug(
      'Using extra S3 Credentials AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY'
    );
    return credentials;
  }
};

/**
 * If an AWS S3 Endpoint is configured in the environment, use it.
 */
const getS3Endpoint = () => {
  if (process.env.AWS_S3_ENDPOINT_URL) {
    logger.debug(
      { endpoint: process.env.AWS_S3_ENDPOINT_URL },
      'Using alternate S3 endpoint'
    );
    return process.env.AWS_S3_ENDPOINT_URL;
  }
};

/**
 * Configure and export a new s3Client to use for all API calls.
 */
module.exports = new S3Client({
  region: process.env.AWS_REGION,
  credentials: getCredentials(),
  endpoint: getS3Endpoint(),
  // Use path-style URLs, which work well with LocalStack/MinIO.
  forcePathStyle: true,
});
