import express from 'express'
import index from './v1/index';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api', index);

app.listen( process.env.PORT,()=>{
    console.log("Server is running...");
})

