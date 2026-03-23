import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import loginRoute from "./routes/route_auth"
import billRoute from "./routes/route_bills";
import budgetRoute from "./routes/route_budgets";
import profileRoute from "./routes/route_profile"
import accountsRoute from "./routes/route_accounts"
import categoryRoute from "./routes/route_categories"
import transactionRoute from "./routes/route_transactions";
import settingsRoute from "./routes/route_settings";

dotenv.config();

const app = express()
const server = http.createServer(app)

// --- #24: Security headers ---
app.use(helmet());

// --- #3: Body size limit (protects against payload-based DoS) ---
app.use(express.json({ limit: '10kb' }));

// --- #2: CORS whitelist (no longer allows any origin) ---
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.get('/', (_req, res) => {
    res.send("Hi!! from server side")
})

app.use('/api/auth', loginRoute);
app.use(`/api/profile`, profileRoute);
app.use(`/api/accounts`, accountsRoute);
app.use(`/api/category`, categoryRoute);
app.use(`/api/transactions`, transactionRoute)
app.use(`/api/budgets`, budgetRoute)
app.use(`/api/bills`, billRoute)
app.use(`/api/settings`, settingsRoute)

// --- #23: Global error handler (catches unhandled async errors) ---
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`The server is listening at ${PORT}`);
})
