import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { User } from '../interfaces';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser: Partial<User> = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const createUserMock: User = mockUser as User;

      jest
        .spyOn(userService, 'createUser')
        .mockResolvedValueOnce(createUserMock);

      const createUserDto = { name: 'John Doe', email: 'john@example.com' };
      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(mockUser);
    });
  });

  // Add more test cases for other controller methods if needed
});
