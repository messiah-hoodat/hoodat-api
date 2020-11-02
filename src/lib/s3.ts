import AWS from 'aws-sdk';

const options: AWS.S3.ClientConfiguration = {
  region: 'us-east-2',
};

export default new AWS.S3(options);
