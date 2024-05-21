import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { of } from 'rxjs';
import { Avatar, User } from '../interfaces';
import { UsersService } from '../users.service';

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
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

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;
  let avatarModel: Model<Avatar>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Avatar'), useValue: mockAvatarModel },
        { provide: HttpService, useValue: mockHttpService },
        // Provide the missing dependency
        { provide: 'USER_SERVICE', useValue: mockUserService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    avatarModel = module.get<Model<Avatar>>(getModelToken('Avatar'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      mockUserModel().findOne.mockResolvedValue(null);
      mockUserModel().save.mockResolvedValue(mockUser);

      const result = await service.createUser(mockUser);
      expect(result).toEqual(mockUser);
      expect(mockUserModel().findOne).toBeCalledWith({ email: mockUser.email });
      expect(mockUserModel().save).toBeCalledWith(mockUser);
    });
  });

  describe('getUserById', () => {
    it('should return user data by id', async () => {
      const userId = 123;
      const result = await service.getUserById(userId);
      expect(result).toEqual(mockUser);
      expect(mockHttpService.get).toBeCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
    });
  });

  describe('getUserAvatar', () => {
    it('should return user avatar', async () => {
      const userId = 123;
      const result = await service.getUserAvatar(userId);
      expect(result).toBeDefined();
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete user avatar', async () => {
      const userId = 123;
      await service.deleteUserAvatar(userId);
      expect(mockAvatarModel.findOneAndDelete).toBeCalledWith({ userId });
    });
  });
});
