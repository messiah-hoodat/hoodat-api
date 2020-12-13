import mongoose from 'mongoose';

import { Contact } from '../src/models/Contact';
import ContactService from '../src/services/ContactService';
import StorageService from '../src/services/StorageService';

beforeEach(() => {
  jest.clearAllMocks();
})

describe('ContactService', () => {
  describe('createContact', () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    const input = {
      name: 'John Doe',
      image: {
        name: 'jdoe.png',
        data: 'TWFuIGlzIGRpc3Rpb='
      }
    };
    jest.spyOn(StorageService, 'uploadContactImage').mockResolvedValue('https://aws.com/hoodat/jdoe.png');

    test('should throw if owner ID is invalid', async () => {
      await expect(ContactService.createContact(input, 'invalid_id')).rejects.toThrow();
    });

    test('should throw if contact fails to save', async () => {
      const saveSpy = jest.spyOn(Contact.prototype, 'save').mockImplementationOnce(() => { throw new Error() });

      await expect(ContactService.createContact(input, id)).rejects.toThrow();
      expect(saveSpy).toBeCalledTimes(1);
    });

    test('should create contact', async () => {
      const saveSpy = jest.spyOn(Contact.prototype, 'save').mockResolvedValueOnce({} as never);

      await expect(ContactService.createContact(input, id)).resolves.not.toThrow();
      expect(saveSpy).toBeCalledTimes(1);
    });
  });

  describe('deleteContact', () => {
    const id = '11111111';

    test('should throw if contact not found', async () => {
      const findSpy = jest.spyOn(Contact, 'findById').mockResolvedValueOnce(undefined);

      await expect(ContactService.deleteContact(id)).rejects.toThrow();
      expect(findSpy).toBeCalledTimes(1);
    });

    test('should throw if error deleting contact', async () => {
      const findSpy = jest.spyOn(Contact, 'findById').mockResolvedValueOnce({ deleteOne: () => { throw new Error() } } as never);

      await expect(ContactService.deleteContact(id)).rejects.toThrow();
      expect(findSpy).toBeCalledTimes(1);
    });

    test('should delete contact', async () => {
      const findSpy = jest.spyOn(Contact, 'findById').mockResolvedValueOnce({ deleteOne: () => { }, image: { url: 'https://aws.com/hoodat/image.png' } } as never);
      const deleteFileSpy = jest.spyOn(StorageService, 'deleteFile').mockResolvedValueOnce();

      await expect(ContactService.deleteContact(id)).resolves.not.toThrow();
      expect(findSpy).toBeCalledTimes(1);
      expect(deleteFileSpy).toBeCalledTimes(1);
    });
  });
});