'use strict';

const logger = require('../../../logger');
const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

// ---------- METADATA (DynamoDB) ----------

function writeFragment(fragment) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  const command = new PutCommand(params);

  try {
    return ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
    throw err;
  }
}

async function readFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  const command = new GetCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
}

async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  const command = new QueryCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return !expand ? data?.Items.map((item) => item.id) : data?.Items;
  } catch (err) {
    logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
    throw err;
  }
}

// ---------- DATA (S3) ----------

async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Convert S3 stream → Buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

/**
 * Delete fragment metadata + data.
 * IMPORTANT: we DON'T throw on S3 delete; metadata is what makes GET 404.
 */
async function deleteFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  const command = new DeleteCommand(params);

  try {
    await ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params }, 'Error deleting fragment metadata from DynamoDB');
  }

  // Best-effort delete from S3
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const s3Command = new DeleteObjectCommand(s3Params);

  try {
    await s3Client.send(s3Command);
    // S3 delete is idempotent; OK even if object didn't exist.
  } catch (err) {
    const { Bucket, Key } = s3Params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    // Don't rethrow – we still want 200 from the API.
  }
}

module.exports = {
  writeFragment,
  writeFragmentData,
  readFragment,
  readFragmentData,
  deleteFragment,
  listFragments,
};
