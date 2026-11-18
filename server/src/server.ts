import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 5000;
connectDatabase()
  .then(() => app.listen(port, () => console.log(`StudyPilot AI API running on http://localhost:${port}`)))
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
