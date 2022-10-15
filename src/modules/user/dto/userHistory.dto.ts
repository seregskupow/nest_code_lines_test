import { Types } from 'mongoose';

export class UserHistoryDto {
  readonly actors: string[];

  readonly owner: string;

  readonly usedImage: string;

  readonly createdAt?: Date;
}
