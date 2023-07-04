import { PineconeClient } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as dotenv from "dotenv";

import { createPineconeIndex } from "./1-createPineconeIndex.js";
import { updatePinecone } from "./2-updatePinecone.js";
import { queryPineconeVectorStoreAndQueryLLM } from "./3-queryPineconeAndQueryGPT.js";


//import http  from 'http'
import express from 'express'
import cors from 'cors'

dotenv.config();

const loader = new DirectoryLoader("./documents", {
    ".txt": (path) => new TextLoader(path),
    ".pdf": (path) => new PDFLoader(path),
});

const docs = await loader.load();
const indexName = "zero-digitale-20230703";
const vectorDimension = 1536;

const client = new PineconeClient();
await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
});

const callApiBot = async(question) => {

    // const q = "Quali servizi offre Zero Digitale?";
    await createPineconeIndex(client, indexName, vectorDimension);
    await updatePinecone(client, indexName, docs);
    return await queryPineconeVectorStoreAndQueryLLM(client, indexName, question);
}

const PORT = 3000
const app = express()


app.use(cors())
app.use(express.json())

app.post('/', async function(req, res) {
    const question = req.body.q
    //console.log('question -> ', req.body.q)
    const resBot = await callApiBot(question)
    //console.log('callApiBot -> ', resBot)
    res.json({risposta: resBot})
})

app.all('*', function(req, res) {
    res.json({risposta: 'Errore 404'})
})

app.listen(PORT, () => {
    console.log(`Sono in ascolto sulla porta ${PORT}`)
})

// const server = http.createServer((request, response) => {
//     response.write('Benvenuto nel nostro ChatBot')
//     response.end()
// })

// server.listen(PORT, () => {
//     console.log(`Sono in ascolto sulla porta ${PORT}`)
// })

