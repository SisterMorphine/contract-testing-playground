import express, { Express, Request, Response } from 'express';
import { Server } from 'http';

const app: Express = express();

interface User {
  id: number;
  name: string;
  status: string;
}

// Mock database
const users: Record<number, User> = {
  1: { id: 1, name: 'John', status: 'ACTIVE' },
  2: { id: 2, name: 'Jane', status: 'ACTIVE' },
};

// Middleware
app.use(express.json());

// Routes
app.get('/users/:id', (req: Request, res: Response) => {
  const user = users[Number(req.params.id)];
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/users', (req: Request, res: Response) => {
  const { name, status } = req.body;
  const id = Math.max(...Object.keys(users).map(Number)) + 1;
  const newUser: User = { id, name, status };
  users[id] = newUser;
  res.status(201).json(newUser);
});

export const startServer = (port: number = 3000): Server => {
  return app.listen(port, () => {
    console.log(`User Service running on port ${port}`);
  });
};

export default app;
