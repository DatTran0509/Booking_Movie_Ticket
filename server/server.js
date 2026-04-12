import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import connectDB, { disconnectDB, getDbHealth } from './configs/db.js';
import { getCorsAllowedOrigins } from './configs/env.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';
import { inngest, functions } from './inngest/index.js';
import adminRouter from './routes/adminRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import showRouter from './routes/showRoutes.js';
import userRouter from './routes/userRoutes.js';

const corsAllowedOrigins = getCorsAllowedOrigins();
const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || corsAllowedOrigins.length === 0 || corsAllowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
};

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhooks);

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Server is running!'));
app.get('/healthz', (req, res) => res.json({
    success: true,
    service: 'server',
    uptime: process.uptime(),
    database: getDbHealth(),
}));

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

app.use((error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error',
    });
});

const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

        const shutdown = async (signal) => {
            console.log(`${signal} received. Shutting down gracefully...`);

            server.close(async () => {
                await disconnectDB();
                process.exit(0);
            });
        };

        process.on('SIGINT', () => {
            void shutdown('SIGINT');
        });

        process.on('SIGTERM', () => {
            void shutdown('SIGTERM');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

void startServer();
