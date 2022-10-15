import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { clamp } from 'lodash';
import { Model, Types } from 'mongoose';
import { UserHistoryDto } from '../dto/userHistory.dto';
import { UserHistoryRepository } from '../repositories/user-history.repository';
import { UserHistory } from '../schemas/user-history.schema';

@Injectable()
export class UserHistoryService {
  constructor(private readonly userHistoryRepository: UserHistoryRepository) {}

  create(dto: UserHistoryDto): Promise<UserHistory> {
    return this.userHistoryRepository.create(dto);
  }

  delete(userId: string, historyId: string) {
    return this.userHistoryRepository.delete(userId, historyId);
  }

  deleteAll(userId: string) {
    return this.userHistoryRepository.deleteAll(userId);
  }

  async getRecords(userId: string, pageNumber = 0, offset = 10) {
    const totalCount = await this.userHistoryRepository.count(userId);
    const totalPages = Math.ceil(totalCount / offset);
    const currentPage = clamp(pageNumber, 0, totalPages - 1);

    const history = await this.userHistoryRepository.getRecords(
      userId,
      currentPage,
      offset,
    );
    return {
      totalCount,
      totalPages,
      currentPage,
      offset,
      history,
    };
  }
}
