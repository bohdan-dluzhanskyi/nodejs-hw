import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

export async function registerUser(req, res) {
  const { email, password } = req.body;

  const isUser = await User.findOne({ email });
  if (isUser) {
    throw createHttpError(400, 'Email in use');
  }
  const hashPass = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashPass,
  });

  const newSession = await createSession(newUser._id);
  setSessionCookies(res, newSession);

  res.status(201).json(newUser);
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const isValidPass = await bcrypt.compare(password, user.password);
  if (!isValidPass) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });
  const newSession = await createSession(user._id);
  setSessionCookies(res, newSession);

  res.status(200).json(user);
}

export async function refreshUserSession(req, res) {
  const session = await Session.findOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isInvalidToken = new Date() > new Date(session.refreshTokenValidUntil);
  if (isInvalidToken) {
    throw createHttpError(401, 'Session token expired');
  }
  await Session.deleteOne({
    _id: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({ message: 'Session refreshed' });
}

export async function logoutUser(req, res) {
  const { sessionId } = req.cookies;
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
}

export async function requestResetEmail(req, res) {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(200)
      .json({ message: 'Password reset email sent successfully' });
  }

  const myToken = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const resPath = path.resolve('src/templates/reset-password-email.html');
  const tempSouce = await fs.readFile(resPath, 'utf-8');
  const temp = handlebars.compile(tempSouce);
  const html = temp({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${myToken}`,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({ message: 'Password reset email sent successfully' });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;

  let dadaToken;
  try {
    dadaToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const user = await User.findOne({
    _id: dadaToken.sub,
    email: dadaToken.email,
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hashPass = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashPass });
  await Session.deleteMany({ userId: user._id });

  res
    .status(200)
    .json({ message: 'Password reset successfully. Please log in again.' });
}
