import {
  Post,
  Get,
  Route,
  Tags,
  Path,
  Security,
  Header,
  Response,
  Body,
  Delete,
  Patch,
  Deprecated,
} from 'tsoa';

import getDecodedToken from '../lib/getDecodedToken';
import {
  ListOutput,
  ListTransformer,
  ListShareesOutput,
} from '../transformers/ListTransformer';
import ListService from '../services/ListService';

export interface AddListInput {
  name: string;
  color?: number;
}

export interface UpdateListInput {
  name?: string;
  color?: number;
}

export interface AddContactImage {
  name: string;
  data: string;
}

export interface AddContactInput {
  name: string;
  image: AddContactImage;
}

interface AddViewerInput {
  email: string;
}

export interface ShareListInput {
  email: string;
  role: Role;
}

export type Role = 'viewer' | 'editor';

export interface UpdateShareeInput {
  role: Role;
}

@Route('/lists')
@Tags('Lists')
export class ListController {
  /**
   * Creates a list that is owned by the user
   */
  @Security('jwt')
  @Response(403)
  @Post('')
  public async addList(
    @Header('Authorization') authHeader: string,
    @Body() input: AddListInput
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.createList(input, token.userId)
    );
  }

  /**
   * Updates a list
   */
  @Security('jwt')
  @Patch('{listId}')
  public async updateList(
    @Path() listId: string,
    @Header('Authorization') authHeader: string,
    @Body() input: UpdateListInput
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.updateList(listId, input, token.userId)
    );
  }

  /**
   * Deletes a list and all contacts on the list
   */
  @Security('jwt')
  @Delete('{listId}')
  public async removeList(
    @Path() listId: string,
    @Header('Authorization') authHeader: string
  ): Promise<any> {
    const token = getDecodedToken(authHeader);

    await ListService.deleteList(listId, token.userId);

    return {
      statusCode: 200,
      message: 'Successfully deleted list',
      listId,
    };
  }

  /**
   * Creates a contact and adds it to a list
   */
  @Security('jwt')
  @Response(403)
  @Response(400)
  @Post('{listId}/contacts')
  public async addContactToList(
    @Path() listId: string,
    @Header('Authorization') authHeader: string,
    @Body() input: AddContactInput
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.addContactToList(listId, input, token.userId)
    );
  }

  /**
   * Removes a contact from a list and deletes the contact
   */
  @Security('jwt')
  @Response(403)
  @Response(400)
  @Delete('{listId}/contacts/{contactId}')
  public async removeContactFromList(
    @Path() listId: string,
    @Path() contactId: string,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.removeContactFromList(contactId, listId, token.userId)
    );
  }

  /**
   * Allows a user to view the list
   */
  @Deprecated()
  @Security('jwt')
  @Response(403)
  @Response(404, 'User not found')
  @Post('{listId}/viewers')
  public async addViewerToList(
    @Path() listId: string,
    @Body() input: AddViewerInput,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.addViewerToList(input.email, listId, token.userId)
    );
  }

  /**
   * Allows a user to edit the list
   */
  @Deprecated()
  @Security('jwt')
  @Response(403)
  @Response(404, 'User not found')
  @Post('{listId}/editors')
  public async addEditorToList(
    @Path() listId: string,
    @Body() input: AddViewerInput,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.addEditorToList(input.email, listId, token.userId)
    );
  }

  /**
   * Shares a list with someone
   */
  @Security('jwt')
  @Response(403)
  @Response(404, 'User not found')
  @Post('{listId}/sharees')
  public async shareList(
    @Path() listId: string,
    @Body() input: ShareListInput,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.shareList(input, listId, token.userId)
    );
  }

  /**
   * Fetches list sharees
   */
  @Security('jwt')
  @Response(403)
  @Get('{listId}/sharees')
  public async getListSharees(
    @Path() listId: string,
    @Header('Authorization') authHeader: string
  ): Promise<ListShareesOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoingSharees(
      await ListService.getListSharees(listId, token.userId)
    );
  }

  /**
   * Revokes a user's permission to view the list
   */
  @Deprecated()
  @Security('jwt')
  @Response(403)
  @Delete('{listId}/viewers/{userId}')
  public async removeViewerFromList(
    @Path() listId: string,
    @Path() userId: string,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.removeViewerFromList(userId, listId, token.userId)
    );
  }

  /**
   * Revokes a user's permission to edit the list
   */
  @Deprecated()
  @Security('jwt')
  @Response(403)
  @Delete('{listId}/editors/{userId}')
  public async removeEditorFromList(
    @Path() listId: string,
    @Path() userId: string,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.removeEditorFromList(userId, listId, token.userId)
    );
  }

  /**
   * Unshares the list with someone
   */
  @Security('jwt')
  @Response(403)
  @Delete('{listId}/sharees/{userId}')
  public async unshareList(
    @Path() listId: string,
    @Path() userId: string,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.removeEditorFromList(userId, listId, token.userId)
    );
  }

  /**
   * Updates a sharees role
   */
  @Security('jwt')
  @Response(403)
  @Patch('{listId}/sharees/{userId}')
  public async updateSharee(
    @Path() listId: string,
    @Path() userId: string,
    @Body() input: UpdateShareeInput,
    @Header('Authorization') authHeader: string
  ): Promise<ListOutput> {
    const token = getDecodedToken(authHeader);

    return ListTransformer.outgoing(
      await ListService.updateSharee(userId, listId, token.userId, input.role)
    );
  }
}
