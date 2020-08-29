import { Controller, Get, Route, Tags } from 'tsoa';

@Route('')
@Tags('Status')
export class IndexController extends Controller {

  /**
  *  Returns status information about the service
  */
  @Get('')
  public async index() {
      return { msg: 'The service is up and running!' };
  }
}