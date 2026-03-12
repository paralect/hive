import AWS from 'aws-sdk';
import axios from 'axios';
import config from '@/config/app';

const Bucket = config.cloudStorage.bucket;
const spacesEndpoint = config.cloudStorage.secretAccessKey ? new AWS.Endpoint(config.cloudStorage.endpoint) : null;

const storage = config.cloudStorage.secretAccessKey ? new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: config.cloudStorage.accessKeyId,
  secretAccessKey: config.cloudStorage.secretAccessKey,
}) : null;

function getSignedUrl(fileName) {
  const params = {
    Bucket,
    Key: fileName,
    Expires: 1800,
  };

  return storage.getSignedUrl('getObject', params);
}

function upload(filePath, file) {
  const params = {
    Bucket,
    ContentType: file.mimetype,
    Body: file.buffer,
    Key: filePath,
    ACL: 'private',
  };

  return storage.upload(params).promise();
}

function uploadPublic(filePath, file) {
  const params = {
    Bucket,
    ContentType: file.mimetype,
    Body: file.buffer,
    Key: filePath,
    ACL: 'public-read',
  };

  return storage.upload(params).promise();
}

function uploadStream(filePath, stream, contentType, isPublic = false) {
  const params = {
    Bucket,
    ContentType: contentType,
    Body: stream,
    Key: filePath,
    ACL: isPublic ? 'public-read' : 'private',
  };

  return storage.upload(params).promise();
}

async function uploadFromUrl(filePath, url, headers = {}, isPublic = false) {
  console.log('getting image', filePath, url, headers);
  const response = await axios({
    method: 'get',
    url: url,
    headers: headers,
    responseType: 'stream',
  });

  const contentType =
    response.headers['content-type'] || 'application/octet-stream';

  return uploadStream(filePath, response.data, contentType, isPublic);
}

function copy(filePath, copyFilePath) {
  const params = {
    Bucket,
    CopySource: `${Bucket}/${copyFilePath}`,
    Key: filePath,
  };

  return storage.copyObject(params).promise();
}

function remove(filePath) {
  const params = {
    Bucket,
    Key: filePath,
  };

  return storage.deleteObject(params).promise();
}

export default {
  getSignedUrl,
  copy,
  upload,
  uploadPublic,
  remove,
  uploadStream,
  uploadFromUrl,
};