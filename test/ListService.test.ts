import mongoose from 'mongoose';

import ListService from '../src/services/ListService';
import { List } from '../src/models/List';
import ContactService from '../src/services/ContactService';
import { Contact } from '../src/models/Contact';

beforeEach(() => {
  jest.clearAllMocks();
})

describe('ListService', () => {
  describe('createList', () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const input = {
      name: 'Hoodat Buds',
      color: 3
    };

    test('should throw if owner ID is invalid', async () => {
      await expect(ListService.createList(input, 'invalid_id')).rejects.toThrow();
    });

    test('should throw if list fails to save', async () => {
      jest.spyOn(List.prototype, 'save').mockImplementationOnce(() => { throw new Error() });

      await expect(ListService.createList(input, id)).rejects.toThrow();
    });

    test('should create list', async () => {
      jest.spyOn(List.prototype, 'save').mockImplementationOnce(() => { });

      await expect(ListService.createList(input, id)).resolves.not.toThrow();
    });
  });

  describe('updateList', () => {
    const listId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();
    const input = {
      name: 'The Homies',
      color: 6
    };

    test('should throw if ID is invalid', async () => {
      await expect(ListService.updateList('invalid_id', input, userId)).rejects.toThrow();
      await expect(ListService.updateList(listId, input, 'invalid_id')).rejects.toThrow();
    });

    test('should throw if list not found', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce(undefined);

      await expect(ListService.updateList(listId, input, userId)).rejects.toThrow();
    });

    test('should throw if user is not the list owner', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ owner: { toString: () => 'not the user!' } } as never);

      await expect(ListService.updateList(listId, input, userId)).rejects.toThrow();
    });

    test('should throw if list fails to save', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ owner: { toString: () => userId }, save: () => { throw new Error() } } as never);

      await expect(ListService.updateList(listId, input, userId)).rejects.toThrow();
    });

    test('should update list', async () => {
      const list = {
        name: 'Hoodat Buds',
        color: 3,
        owner: { toString: () => userId },
        save: () => undefined,
        populate() { return this; },
        execPopulate() { return this; }
      };
      jest.spyOn(List, 'findById').mockResolvedValueOnce(list as never);

      const updatedList = await ListService.updateList(listId, input, userId);

      expect(updatedList.name).toEqual(input.name);
      expect(updatedList.color).toEqual(input.color);
    });

    test('should not update color if input.color is undefined', async () => {
      const input = {
        name: 'The Homies',
        color: undefined,
      }
      const list = {
        name: 'Hoodat Buds',
        color: 3,
        owner: { toString: () => userId },
        save: () => undefined,
        populate() { return this; },
        execPopulate() { return this; }
      };
      jest.spyOn(List, 'findById').mockResolvedValueOnce(list as never);

      const updatedList = await ListService.updateList(listId, input, userId);

      expect(updatedList.name).toEqual(input.name);
      expect(updatedList.color).toEqual(3);
    });

    test('should not update name if name is undefined', async () => {
      const input = {
        name: undefined,
        color: 6,
      }
      const list = {
        name: 'Hoodat Buds',
        color: 3,
        owner: { toString: () => userId },
        save: () => undefined,
        populate() { return this; },
        execPopulate() { return this; }
      };
      jest.spyOn(List, 'findById').mockResolvedValueOnce(list as never);

      const updatedList = await ListService.updateList(listId, input, userId);

      expect(updatedList.name).toEqual('Hoodat Buds');
      expect(updatedList.color).toEqual(input.color);
    });
  });

  describe('deleteList', () => {
    const listId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();
    jest.spyOn(ContactService, 'deleteContact').mockImplementation(() => undefined);

    test('should throw if ID is invalid', async () => {
      await expect(ListService.deleteList('invalid_id', userId)).rejects.toThrow();
      await expect(ListService.deleteList(listId, 'invalid_id')).rejects.toThrow();
    });

    test('should throw if list not found', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce(undefined);

      await expect(ListService.deleteList(listId, userId)).rejects.toThrow();
    });

    test('should throw if user is not the list owner', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ owner: { toString: () => 'not the user!' } } as never);

      await expect(ListService.deleteList(listId, userId)).rejects.toThrow();
    });

    test('should throw if list fails to delete', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ contacts: [{ _id: '1' }], owner: { toString: () => userId }, deleteOne: () => { throw new Error() } } as never);

      await expect(ListService.deleteList(listId, userId)).rejects.toThrow();
    });

    test('should delete list', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ contacts: [{ _id: '1' }], owner: { toString: () => userId }, deleteOne: () => undefined } as never);

      await expect(ListService.deleteList(listId, userId)).resolves.not.toThrow();
    });
  });

  describe('addContactToList', () => {
    const listId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();
    const input = {
      name: 'John Doe',
      image: {
        name: 'jdoe.png',
        data: 'TWFuIGlzIGRpc3Rpb='
      }
    };
    jest.spyOn(ContactService, 'createContact').mockResolvedValue({ _id: 'new_id' } as never);

    test('should throw if ID is invalid', async () => {
      await expect(ListService.addContactToList('invalid_id', input, userId)).rejects.toThrow();
      await expect(ListService.addContactToList(listId, input, 'invalid_id')).rejects.toThrow();
    });

    test('should throw if list not found', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce(undefined);

      await expect(ListService.addContactToList(listId, input, userId)).rejects.toThrow();
    });

    test('should throw if user is not the list owner', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ owner: { toString: () => 'not the user!' } } as never);

      await expect(ListService.addContactToList(listId, input, userId)).rejects.toThrow();
    });

    test('should throw if list fails to save', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ contacts: [], owner: { toString: () => userId }, save: () => { throw new Error() } } as never);

      await expect(ListService.addContactToList(listId, input, userId)).rejects.toThrow();
    });

    test('should add contact to list', async () => {
      const list = {
        contacts: [],
        owner: { toString: () => userId },
        save: () => undefined,
        populate() { return this; },
        execPopulate() { return this; }
      };
      jest.spyOn(List, 'findById').mockResolvedValueOnce(list as never);

      const updatedList = await ListService.addContactToList(listId, input, userId);
      expect(updatedList.contacts.length).toBe(1);
      expect(updatedList.contacts[0]).toBe('new_id')
    });
  });

  describe('removeContactFromList', () => {
    const contactId = new mongoose.Types.ObjectId().toHexString();
    const listId = new mongoose.Types.ObjectId().toHexString();
    const userId = new mongoose.Types.ObjectId().toHexString();
    jest.spyOn(ContactService, 'deleteContact').mockImplementation(() => undefined);

    test('should throw if ID is invalid', async () => {
      await expect(ListService.removeContactFromList('invalid_id', listId, userId)).rejects.toThrow();
      await expect(ListService.removeContactFromList(contactId, 'invalid_id', userId)).rejects.toThrow();
      await expect(ListService.removeContactFromList(contactId, listId, 'invalid_id')).rejects.toThrow();
    });

    test('should throw if list not found', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce(undefined);

      await expect(ListService.removeContactFromList(contactId, listId, userId)).rejects.toThrow();
    });

    test('should throw if user is not the list owner', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ owner: { toString: () => 'not the user!' } } as never);

      await expect(ListService.removeContactFromList(contactId, listId, userId)).rejects.toThrow();
    });

    test('should throw if contact not found', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ owner: { toString: () => userId } } as never);
      jest.spyOn(Contact, 'findById').mockResolvedValueOnce(undefined);

      await expect(ListService.removeContactFromList(contactId, listId, userId)).rejects.toThrow();
    });

    test('should throw list fails to save', async () => {
      jest.spyOn(List, 'findById').mockResolvedValueOnce({ contacts: [contactId], owner: { toString: () => userId }, save: () => { throw new Error() } } as never);
      jest.spyOn(Contact, 'findById').mockResolvedValueOnce({ _id: contactId } as never);

      await expect(ListService.removeContactFromList(contactId, listId, userId)).rejects.toThrow();
    });

    test('should remove contact from list', async () => {
      const list = {
        contacts: [contactId],
        owner: { toString: () => userId },
        save: () => undefined,
        populate() { return this; },
        execPopulate() { return this; }
      };
      jest.spyOn(List, 'findById').mockResolvedValueOnce(list as never);
      jest.spyOn(Contact, 'findById').mockResolvedValueOnce({ _id: contactId } as never);

      const updatedList = await ListService.removeContactFromList(contactId, listId, userId);
      expect(updatedList.contacts.length).toBe(0);
    });
  });

  describe('getLists', () => {
    const userId = new mongoose.Types.ObjectId().toHexString();

    test('should get lists belonging to the user', async () => {
      const list = {
        populate() { return [{ _id: '1' }, { _id: '2' }]; },
      };
      jest.spyOn(List, 'find').mockReturnValueOnce(list as never);

      const lists = await ListService.getLists(userId);

      expect(lists.length).toBe(2);
    });
  });
});