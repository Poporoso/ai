/*
    1. Importo moduli richiesti
*/
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";

/*
    2. Esporto la funzione queryPineconeVectorStoreAndQueryLLM
*/
export const queryPineconeVectorStoreAndQueryLLM = async (
    client,
    indexName,
    question
) => {

    /*
        3. Inizio processo di Query
    */
    // console.log("Interrogazione dell'archivio vettoriale Pinecone...");

    /*
        4. Recupera l'indice Pinecone
    */
    const index = client.Index(indexName);

    /*
        5. Crea l'incorporamento della query
    */
    const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

    /*
        6. Interroga l'indice Pinecone e restituisci le prime 10 corrispondenze
    */ 
    let queryResponse = await index.query({
        queryRequest: {
            topK: 10,
            vector: queryEmbedding,
            includeMetadata: true,
            includeValues: true,
        },
    });

    /*
        7. Log del numero di corrispondenze
    */
    // console.log(`Trovate ${queryResponse.matches.length} corrispondenze...`);

    /*
        8. Log della domanda da esporre
    */
    // console.log(`Domanda esposta: ${question}...`);

    if (queryResponse.matches.length) 
    {
        /*
            9. creo un istanza OpenAI e carico la QAStuffChain (che non so cosa sia)
        */
        const llm = new OpenAI({});
        const chain = loadQAStuffChain(llm);

        /*
            10. Estraggo e concateno il contenuto della pagina dai documenti corrispondenti
        */
        const concatenatedPageContent = queryResponse.matches
                                            .map((match) => match.metadata.pageContent)
                                            .join(" ");
        
        /*
            11. Eseguire la catena con i documenti di input e la domanda
        */
        const result = await chain.call({
            input_documents: [new Document({ pageContent: concatenatedPageContent })],
            question: question,
        });

        /*
            12. Log della risposta
        */
        return result.text

        // // console.log(`Risposta: ${result.text}`);
    } 
    else 
    {
        /*
            13. Registra che non ci sono corrispondenze, quindi GPT-3 non verrà interrogato
        */
        // console.log("Non ci sono corrispondenze, quindi GPT-3 non verrà interrogato");
    }
};