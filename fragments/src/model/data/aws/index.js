// src/model/data/aws/index.js

// Use the in-memory store for fragment metadata (until DynamoDB is added)
const memory = require('../memory');
const logger = require('../../../logger');
const s3Client = require('./s3Client');
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

// ---------- METADATA (MemoryDB) ----------

function writeFragment(ownerId, id, fragment) {
  return memory.writeFragment(ownerId, id, fragment);
}

function readFragment(ownerId, id) {
  return memory.readFragment(ownerId, id);
}

function listFragments(ownerId, expand = false) {
  return memory.listFragments(ownerId, expand);
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

async function deleteFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new DeleteObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data');
  }
}

async function deleteFragment(ownerId, id) {
  await deleteFragmentData(ownerId, id);
  return memory.deleteFragment(ownerId, id);
}

module.exports = {
  writeFragment,
  writeFragmentData,
  readFragment,
  readFragmentData,
  deleteFragment,
  listFragments,
};
