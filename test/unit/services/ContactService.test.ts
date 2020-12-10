import ContactService from '../../../src/services/ContactService';
import { AddContactInput } from '../../../src/controllers/ListController';

jest.mock('../../../src/lib/s3', () => {
  return { upload: (params: any) => { } }
})

jest.mock('../../../src/models/Contact.ts', () => {
  return (doc: any) => { };
})


describe('ContactService', () => {
  describe('createContact', () => {
    const ownerId = '1';

    it('should throw if file extension is not supported', async () => {
      const input: AddContactInput = {
        name: 'John Doe',
        image: {
          name: '1234567890.mp4',
          data: 'base64-data'
        }
      };

      expect(ContactService.createContact(input, ownerId)).rejects.toThrow();
    });
  });
});