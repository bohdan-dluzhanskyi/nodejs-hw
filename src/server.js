import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';
import { logger } from './middleware/logger.js';

const app = express();

const PORT = process.env.PORT ?? 3000;


// Middleware
app.use(express.json());
app.use(cors());
app.use(logger);

app.use(notesRoutes)

app.use(notFoundHandler);

app.use(errorHandler);


await connectMongoDB();

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



