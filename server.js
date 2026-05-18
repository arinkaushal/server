import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './Socket/index.js';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import client from 'prom-client';

import connectDB from './dbCon.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/user.js';

const app = express();

const FRONTEND = process.env.VITE_APP_URL;
const MONGO = process.env.MONGO_URI;

/* ---------------- PROMETHEUS ---------------- */

// collect default Node.js metrics
client.collectDefaultMetrics();

// metrics endpoint
//make a health endpoint to check the database 
app.get('/health', async (req, res) => {
  try {
    await connectDB(MONGO);
    //fetch a simple query to check if the database is responsive
    const db = client.db();
    await db.collection('users').findOne({});
    res.status(200).send('Server and database are running');
  } catch (error) {
    res.status(500).send('Error occurred while checking health');
  }
});
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

/* ------------------------------------------- */

app.use(express.json());

app.use(cors({
  origin: FRONTEND,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.options('*', cors({
  origin: FRONTEND,
  credentials: true
}));

connectDB(MONGO);

// const sessionMiddleware = session({
//   secret: process.env.SESSION_SECRET || 'dev_secret_key',
//   resave: false,
//   saveUninitialized: false,
//   store: MongoStore.create({
//     mongoUrl: MONGO
//   }),
//   cookie: {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: false,
//     maxAge: 1000 * 60 * 60 * 24
//   },
// });
app.set('trust proxy', 1);
const sessionMiddleware = session({
  secret: 'dev_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  },
});
console.log("added actual proxy trusts and middlware changes");
app.use(sessionMiddleware);


app.use('/api/auth', authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server, sessionMiddleware);


server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});
