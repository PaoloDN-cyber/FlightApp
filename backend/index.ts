import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import cors from 'cors';
import crypto from 'crypto';

import authRoutes from './routes/auth.routes.js';
import airlineRoutes from './routes/airline.routes.js';
import adminRoutes from './routes/admin.routes.js';
import airlineOpsRoutes from './routes/airlineOps.routes.js';
import searchRoutes from './routes/search.routes.js';
import ticketRoutes from './routes/ticket.routes.js';

import { errorHandler } from './middleware/errorHHandler.js';
import * as user from './models/User.model.js';
import { initSocket, getIO } from './socket.js';


import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.options('*', cors());

// Rotte
app.use('/auth', authRoutes);
app.use('/airline', airlineRoutes);
app.use('/admin', adminRoutes);
app.use('/airline-panel', airlineOpsRoutes);
app.use('/flights', searchRoutes);
app.use('/tickets', ticketRoutes);

// Static assets
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// JWT error handler
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: err.message });
  }
  next(err);
});

// Central error handler
app.use(errorHandler);

// Seed passwords & admin
async function seed() {
  const Model = user.getModel();
  const raws  = await Model.find({ password: { $exists: true } });
  for (const u of raws) {
    const salt   = crypto.randomBytes(16).toString('hex');
    const digest = crypto.createHmac('sha512', salt).update(u.password).digest('hex');
    await Model.updateOne({ _id: u._id }, { $set: { salt, digest }, $unset: { password: "" } });
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/flightapp');
  console.log('Connesso a MongoDB');
  await seed();

  // Assicurati esista admin
  const adminExists = await user.getModel().findOne({ role: 'admin' });
  if (!adminExists) {
    const a = user.newUser({ email: 'admin@superadmin.com', role: 'admin', name: 'Super Admin', password: 'adminpass' });
    a.setPassword('adminpass');
    await a.save();
  }

  // Inizializza Socket.IO
  initSocket(server);
  const io = getIO();
  app.set('io', io);

  server.listen(PORT, () => console.log(` Server su porta ${PORT}`));
}

main().catch(err => {
  console.error('Startup error:', err);
  process.exit(1);
});
