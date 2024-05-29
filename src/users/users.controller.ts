import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('users')
  async createUser(@Body() userDto: any) {
    return this.userService.createUser(userDto);
  }

  @Get('user/:userId')
  async getUserById(@Param('userId') userId: number) {
    return this.userService.getUserById(userId);
  }

  @Get('user/:userId/avatar')
  async getUserAvatar(@Param('userId') userId: number) {
    return this.userService.getUserAvatar(userId);
  }

  @Delete('user/:userId/avatar')
  async deleteUserAvatar(@Param('userId') userId: number) {
    return this.userService.deleteUserAvatar(userId);
  }
}
