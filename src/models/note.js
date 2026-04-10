import { Schema, model } from 'mongoose';

import { TAGS } from '../constants/tags.js';

const noteShema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      required: false,
      enum: TAGS,
      default: 'Todo',
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

noteShema.index(
  { title: 'text', content: 'text' },
  {
    name: 'NotesTextIndex',
    weights: { title: 5, content: 1 },
    default_language: 'english',
  },
);

export const Note = model('Note', noteShema);
