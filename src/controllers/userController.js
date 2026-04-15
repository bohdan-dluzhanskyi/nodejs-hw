import createHttpError from 'http-errors';

import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { User } from '../models/user.js';

export async function updateUserAvatar(req, res) {
  if (!req.file) {
    throw createHttpError(400, 'No file');
  }

  const result = await saveFileToCloudinary(req.file.buffer);
  if (!result) {
    throw createHttpError(500, 'Error of upload avatar(');
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { avatar: result.secure_url },
    { returnDocument: 'after' },
  );
  if (!user) {
    throw createHttpError(500, 'Sorry, error of update user-avatar');
  }

  res.status(200).json({ url: user.avatar });
}
