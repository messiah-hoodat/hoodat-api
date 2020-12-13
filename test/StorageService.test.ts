import StorageService from '../src/services/StorageService';

const url = 'https://aws.com/hoodat/image.png';

describe('StorageService', () => {
  describe('uploadContactImage', () => {
    const id = '1111111111';

    test('should throw if file type not supported', async () => {
      const image = {
        name: 'image.mp4',
        data: 'TWFuIGlzIGRpc3Rpb='
      };

      await expect(StorageService.uploadContactImage(image, id)).rejects.toThrow();
    });

    test('should throw if error uploading file', async () => {
      const image = {
        name: 'image.png',
        data: 'TWFuIGlzIGRpc3Rpb='
      };
      jest.spyOn(StorageService.s3, 'upload').mockImplementationOnce(() => { throw new Error() });

      await expect(StorageService.uploadContactImage(image, id)).rejects.toThrow();
    });

    test('should upload file', async () => {
      const image = {
        name: 'image.png',
        data: 'TWFuIGlzIGRpc3Rpb='
      };
      jest.spyOn(StorageService.s3, 'upload').mockReturnValueOnce({ promise: async () => ({ data: { Location: url } }) } as never);

      await expect(StorageService.uploadContactImage(image, id)).resolves.not.toThrow();
    });
  });

  describe('deleteFile', () => {
    test('should throw if url is invalid', async () => {
      const url = 'invalid_url';

      await expect(StorageService.deleteFile(url)).rejects.toThrow();
    });

    test('should throw if error deleting file', async () => {
      jest.spyOn(StorageService.s3, 'deleteObject').mockImplementationOnce(() => { throw new Error() });

      await expect(StorageService.deleteFile(url)).rejects.toThrow();
    });

    test('should delete file', async () => {
      jest.spyOn(StorageService.s3, 'deleteObject').mockReturnValueOnce({ promise: () => { } } as never);

      await expect(StorageService.deleteFile(url)).resolves.not.toThrow();
    });
  });
});