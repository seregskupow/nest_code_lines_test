import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Exclude, Transform } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ collection: 'users' })
export class User {
  _id: string;

  @Prop({ required: true, min: 6, max: 255 })
  name?: string;

  @Prop({ required: true, min: 6, max: 255 })
  email?: string;

  @Prop()
  @Exclude()
  password?: string;

  @Prop({ default: null })
  avatar?: string;

  @Prop({ default: null })
  @Exclude()
  googleId?: string;

  @Prop({ default: false })
  @Exclude()
  activated?: boolean;

  @Exclude()
  __v?: number;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export { UserSchema };
