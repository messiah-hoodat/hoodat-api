import { Controller, Get, Route, Tags } from 'tsoa';

@Route('')
@Tags('Health Checks')
export class IndexController extends Controller {
  @Get('')
  public async index() {
      return { msg: 'The service is up and running!' };
  }
}