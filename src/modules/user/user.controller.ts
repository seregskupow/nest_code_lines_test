import { AuthenticatedGuard } from '@core/guards/authenticated.guard';
import { ImgUploadService } from '@core/imageUploader/img-upload.service';
import MongooseClassSerializerInterceptor from '@core/interceptors/mongoose.interceptor';
import { NotFoundInterceptor } from '@core/interceptors/notFound.interceptor';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserDto } from './dto/user.dto';
import { User } from './schemas/user.schema';
import { UserHistoryService } from './services/user-history.service';
import { UserService } from './services/user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userHistoryService: UserHistoryService,
    private readonly imgUploadService: ImgUploadService,
  ) {}

  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  @Post('/create')
  async create(@Body() userData: CreateUserDto) {
    const newUser = await this.userService.create(userData);
    return newUser;
  }

  @Get('/me')
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  getMe(@Req() req: SessionRequest) {
    console.log({ USER: req.user });
    return req.user;
  }

  @Get('/id/:id')
  //@UseGuards(AuthenticatedGuard)
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  async getUserById(@Param('id') id: string) {
    const u = await this.userService.findOneById(id);
    console.log({ u });
    return u;
  }

  // @Get('/email/:email')
  // @UseInterceptors(ClassSerializerInterceptor)
  // async getUserByEmail(@Param('email') email: string): Promise<User> {
  //   return await this.userService.findOneByEmail(email);
  // }

  @Patch('editprofile')
  @UseGuards(AuthenticatedGuard)
  @UseInterceptors(
    MongooseClassSerializerInterceptor(User),
    FileInterceptor('avatar'),
    new NotFoundInterceptor('No user found for given userId'),
  )
  async update(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: SessionRequest,
  ) {
    if (avatar) {
      try {
        const dataUri =
          'data:image/jpeg;base64,' + avatar.buffer.toString('base64');
        const avatarURL = await this.imgUploadService.uploadAvatar(dataUri);
        updateUserDto.avatar = avatarURL.secure_url;
      } catch (error) {
        throw new NotImplementedException('Error while uploading avatar');
      }
    }
    return await this.userService.update(req.user._id, updateUserDto);
  }

  @Delete('delete_user')
  @UseGuards(AuthenticatedGuard)
  async deleteUser(@Req() req: SessionRequest) {
    await this.userService.delete(req.user._id);
    return 'User and user history were deleted';
  }

  @Get('/user_history')
  @UseGuards(AuthenticatedGuard)
  async getHistory(
    @Req() req: SessionRequest,
    @Query('page_number') pageNumber: number,
    @Query('offset') offset?: number,
  ) {
    if (pageNumber) {
      return await this.userHistoryService.getRecords(
        req.user._id,
        pageNumber,
        offset,
      );
    }
    return '';
  }

  @Delete('history_record/:historyId')
  @UseGuards(AuthenticatedGuard)
  async deleteHistoryRecord(
    @Req() req: SessionRequest,
    @Param('historyId') historyId: string,
  ) {
    await this.userHistoryService.delete(req.user._id, historyId);
    return `Record ${historyId} was deleted`;
  }

  @Delete('all_history')
  @UseGuards(AuthenticatedGuard)
  async deleteAllHistory(@Req() req: SessionRequest) {
    await this.userHistoryService.deleteAll(req.user._id);
    return 'All history was deleted';
  }
}
