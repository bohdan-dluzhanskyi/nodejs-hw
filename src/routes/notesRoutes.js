import { Router } from 'express';
import { celebrate } from 'celebrate';

import { authenticate } from '../middleware/authenticate.js';

import {
  getAllNotes,
  getNoteById,
  createNote,
  deleteNote,
  updateNote,
} from '../controllers/notesController.js';
import {
  getAllNotesSchema,
  noteIdSchema,
  createNoteSchema,
  updateNoteSchema,
} from '../validations/notesValidation.js';

const router = Router();

router.use('/notes', authenticate);

router.get('/notes', celebrate(getAllNotesSchema), getAllNotes);
router.post('/notes', celebrate(createNoteSchema), createNote);

router.get('/notes/:noteId', celebrate(noteIdSchema), getNoteById);
router.patch('/notes/:noteId', celebrate(updateNoteSchema), updateNote);
router.delete('/notes/:noteId', celebrate(noteIdSchema), deleteNote);

export default router;
