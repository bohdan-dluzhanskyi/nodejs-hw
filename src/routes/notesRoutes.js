import { Router } from "express";
import { celebrate } from 'celebrate';
import { getAllNotes, getNoteById, createNote, updateNote, deleteNote }
from "../controllers/notesController.js";
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

const router = Router();

// GET /notes
router.get('/notes', celebrate(getAllNotesSchema), getAllNotes);

// GET /notes/:noteId
router.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById);

// POST /notes
router.post('/notes', celebrate(createNoteSchema), createNote);

// PATCH /notes/:noteId
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);

// DELETE /notes/:noteId
router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

export default router;


