import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { User } from './interfaces';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const createMockUser = {
  email: 'george.bluth@reqres.in',
  first_name: 'George',
  last_name: 'Bluth',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
};

const mockUser = {
  id: 1,
  email: 'george.bluth@reqres.in',
  first_name: 'George',
  last_name: 'Bluth',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
};

const mockAvatar = {
  userId: 1,
  hash: 'bfd5431ce374f33ce84a5e45def3a42c',
  filePath: '../uploads/bfd5431ce374f33ce84a5e45def3a42c',
};

const mockUserModel = jest.fn().mockImplementation(() => ({
  findOne: jest.fn(() => Promise.resolve(null)),
  save: jest.fn(),
}));

const mockAvatarModel = {
  findOne: jest.fn(() => Promise.resolve(mockAvatar)),
  save: jest.fn(),
  findOneAndDelete: jest.fn(),
};

const mockHttpService = {
  get: jest.fn(() => of({ data: { data: mockUser } })),
};

const mockUserService = {
  // Implement mock user service methods here if necessary
};

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Avatar'), useValue: mockAvatarModel },
        { provide: HttpService, useValue: mockHttpService },
        { provide: 'USER_SERVICE', useValue: mockUserService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      jest
        .spyOn(userService, 'createUser')
        .mockResolvedValueOnce(createMockUser as User);

      const result = await controller.createUser(createMockUser);

      expect(result).toEqual(createMockUser);
      expect(result).toHaveProperty('first_name', 'George');
      expect(result).toHaveProperty('last_name', 'Bluth');
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = 1;
      jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValueOnce(mockUser as User);

      const result = await controller.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserAvatar', () => {
    it('should return a user avatar', async () => {
      const userId = 1;
      const avatar = 'base64Avatar';
      jest.spyOn(userService, 'getUserAvatar').mockResolvedValueOnce(avatar);

      const result = await controller.getUserAvatar(userId);

      expect(result).toEqual(avatar);
      expect(userService.getUserAvatar).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete a user avatar', async () => {
      const userId = 1;
      jest.spyOn(userService, 'deleteUserAvatar');

      const result = await controller.deleteUserAvatar(userId);

      expect(result).toBeUndefined();
      expect(userService.deleteUserAvatar).toHaveBeenCalledWith(userId);
    });
  });
});
