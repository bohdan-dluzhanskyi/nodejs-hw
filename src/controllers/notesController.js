import { Note } from '../models/note.js';
import createHttpError from 'http-errors';

export const getAllNotes = async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;
  const skip = (page - 1) * perPage;

  const notesGet = Note.find();

  if (tag) {
    notesGet.where('tag').equals(tag);
  }
  if (search) {
    notesGet.where({ $text: { $search: search } });
  }

  const [totalNotes, notes] = await Promise.all([
    notesGet.clone().countDocuments(),
    notesGet.skip(skip).limit(perPage),
  ]);
  const totalPages = Math.ceil(totalNotes / perPage);

  res.status(200).json({ page, perPage, totalNotes, totalPages, notes });
};

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
}

export const createNote = async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
};

export const deleteNote = async (req, res) => {
  const noteId = req.params.noteId;
  const note = await Note.findOneAndDelete({ _id: noteId });
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
}

export const updateNote = async (req, res) => {
  const noteId = req.params.noteId;
  const note = await Note.findOneAndUpdate({ _id: noteId }, req.body, { returnDocument: 'after' });
  if (!note) {
    throw createHttpError(404, 'Note not found');
  }
  res.status(200).json(note);
}
