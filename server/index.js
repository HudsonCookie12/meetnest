import express from 'express';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const app = express();
const port = Number(process.env.PORT || 3001);
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '../dist');
app.disable('x-powered-by');

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.post('/api/rooms', (_req, res) => {
  res.status(201).json({ roomCode: randomBytes(4).toString('hex').toUpperCase() });
});
app.use(express.static(dist));
app.get('*path', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.listen(port, () => console.log(`MeetNest server listening on port ${port}`));
