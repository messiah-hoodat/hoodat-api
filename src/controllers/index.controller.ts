import { Controller, Get, Route, Tags } from 'tsoa';

@Route('')
@Tags('Health Checks')
export class IndexController extends Controller {
  @Get('')
  public async index() {
      return { msg: 'Hello, world! :-)' };
  }

  @Get('/msg')
  public msg() {
      return { msg: 'This is a message' };
  }
}