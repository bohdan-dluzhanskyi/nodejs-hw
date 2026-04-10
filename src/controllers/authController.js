import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';

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
