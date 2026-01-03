import express from 'express'
import http from 'http'
import cors from 'cors'
import loginRoute from "./routes/route_auth"
import profileRoute from "./routes/route_profile"
import accountsRoute from "./routes/route_accounts"
import categoryRoute from "./routes/route_categories"
import transactionRoute from "./routes/route_transactions";

const app = express()
const server = http.createServer(app)
app.use(express.json());
app.use(cors());

app.get('/',(req,res)=>{
    res.send("Hi!! from server side")
})

app.use('/api/auth', loginRoute);
app.use(`/api/profile`, profileRoute);
app.use(`/api/accounts`, accountsRoute);
app.use(`/api/category`, categoryRoute);
app.use(`/api/transactions`,transactionRoute)

server.listen(8000,()=>{
    console.log("The server is listening at 8000");
})
