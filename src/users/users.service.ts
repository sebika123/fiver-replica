import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(data: Partial<User>) {
    if (!data.email) {
      throw new Error('Email is required');
    }
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = new this.userModel(data);
    return user.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async findAll() {
    return this.userModel.find();
  }

  async saveOTP(userId: string | Types.ObjectId, otp: string) {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    await this.userModel.findByIdAndUpdate(userId, { otp, otpExpiry: expiry });
  }

  async verifyOTP(userId: string, otp: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return false;
    if (user.otp !== otp) return false;
    if (user.otpExpiry < new Date()) return false;
    return true;
  }

  async activateUser(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      isActive: true,
      otp: null,
      otpExpiry: null,
    });
  }
}
