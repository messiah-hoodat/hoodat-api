import { Controller, Get, Route, Tags, Hidden, Body, Post } from 'tsoa';

@Route('')
@Tags('Status')
@Hidden()
export class IndexController extends Controller {
  /**
   *  Returns status information about the service
   */
  @Get('')
  public async index() {
    return { message: 'The service is up and running!' };
  }
}
