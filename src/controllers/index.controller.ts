import Boom from '@hapi/boom';
import { Controller, Get, Route, Tags, Hidden, Body, Post } from 'tsoa';

import s3 from '../lib/s3';

@Route('')
@Tags('Status')
@Hidden()
export class IndexController extends Controller {
  /**
   *  Returns status information about the service
   */
  @Get('')
  public async index() {
    return { msg: 'The service is up and running! :-)' };
  }

  @Post('/upload-test')
  public async uploadTest(@Body() body): Promise<any> {
    const { AWS_S3_BUCKET_NAME } = process.env;

    const params = {
      Bucket: AWS_S3_BUCKET_NAME,
      Key: 'hello_world_9.txt',
      Body: 'hello, world',
    };

    let data;
    try {
      data = await s3.upload(params).promise();
    } catch (err) {
      console.log(err);
      throw Boom.internal('Error uploading file: ', err);
    }

    return data;
  }
}
