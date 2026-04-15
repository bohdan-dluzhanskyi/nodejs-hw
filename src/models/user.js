import { Schema, model } from 'mongoose';

const userScema = new Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      min: 8,
    },
    avatar: {
      type: String,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userScema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userScema.pre('save', function () {
  if (!this.username) {
    this.username = this.email;
  }
});

export const User = model('User', userScema);
