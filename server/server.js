import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from './inngest/index.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())
// Connect to MongoDB
await connectDB();


// API Routes
app.get('/', (req, res) => res.send('Sever is running!'));
app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
