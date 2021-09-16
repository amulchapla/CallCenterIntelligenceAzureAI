require('dotenv').config()
const express = require('express')
const axios = require('axios');
const app = express()
const port = process.env.WEB_PORT || 8080; //Don't use port 3000 since React using port 3000 by default

//"use strict";
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const { json } = require('express');

app.use(express.json());

app.get('/api/sayhello', (req, res) => {
  res.send('Hello World from the backend!')
});

app.get('/api/get-speech-token', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION;

    if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
        res.status(400).send('You forgot to add your speech key or region to the .env file.');
    } else {
        const headers = { 
            headers: {
                'Ocp-Apim-Subscription-Key': speechKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            console.log(`Speechkey loaded for speech region ${speechRegion}. Gettig token`)
            const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
            res.send({ token: tokenResponse.data, region: speechRegion });
        } catch (err) {
            res.status(401).send('There was an error authorizing your speech key.');
        }
    }
});

app.post('/api/ta-key-phrases', async (req, res) => { 
    //You can find your key and endpoint in the resource's key and endpoint page, under resource management.
    const textAnalyticsKey = process.env.TEXTANALYTICS_KEY;
    const textAnalyticsEndpoint = process.env.TEXTANALYTICS_ENDPOINT;    

    const requestJSON = JSON.stringify(req.body);
    //console.log('JSON string request body ' + requestJSON);

    const requestText = JSON.stringify(req.body.transcript);
    //console.log('Received transcription text : ' + requestText);

    try {
        const keyPhrasesInput = [
            requestText,
        ];
        const textAnalyticsClient = new TextAnalyticsClient(textAnalyticsEndpoint,  new AzureKeyCredential(textAnalyticsKey));

        const keyPhraseResult =  await textAnalyticsClient.extractKeyPhrases(keyPhrasesInput);             
        keyPhraseResult.forEach(document => {            
            keyPhraseResponse = document.keyPhrases;            
        });   

        const entityResults = await textAnalyticsClient.recognizeEntities(keyPhrasesInput);        
        entityResults.forEach(document => {
            console.log(`Document ID: ${document.id}`);
            document.entities.forEach(entity => {
                if(entity.confidenceScore > 0.5){
                    console.log(`\tName: ${entity.text} \tCategory: ${entity.category} \tSubcategory: ${entity.subCategory ? entity.subCategory : "N/A"}`);
                    //console.log(`\tScore: ${entity.confidenceScore}`);                    
                }
            });
        });          

        const piiResults = await textAnalyticsClient.recognizePiiEntities(keyPhrasesInput, "en");
        for (const result of piiResults) {
            if (result.error === undefined) {
                console.log("Redacted Text: ", result.redactedText);
                console.log(" -- Recognized PII entities for input", result.id, "--");
                for (const entity of result.entities) {
                    console.log(entity.text, ":", entity.category, "(Score:", entity.confidenceScore, ")");
                }
            } else {
                console.error("Encountered an error:", result.error);
            }
        }


        const headers = { 'Content-Type': 'application/json' };  
        res.headers = headers;                  
        res.send({ keyPhrasesExtracted: keyPhraseResponse, entityExtracted: entityResults, piiExtracted: piiResults });
    } catch (err) {
        console.log(err);
        res.status(401).send('There was an error authorizing your text analytics key. Check your text analytics service key or endpoint to the .env file.');
    }        
});

app.post('/api/ta-key-phrases-old', async (req, res) => { 
    //You can find your key and endpoint in the resource's key and endpoint page, under resource management.
    const textAnalyticsKey = process.env.TEXTANALYTICS_KEY;
    const textAnalyticsEndpoint = process.env.TEXTANALYTICS_ENDPOINT;  
    const requestJSON = JSON.stringify(req.body);
    //console.log('JSON string request body ' + requestJSON);
    const requestText = JSON.stringify(req.body.transcript);
    console.log('Received transcription text : ' + requestText);

    try {
        const keyPhrasesInput = [
            requestText,
        ];
        const textAnalyticsClient = new TextAnalyticsClient(textAnalyticsEndpoint,  new AzureKeyCredential(textAnalyticsKey));
        const keyPhraseResult =  await textAnalyticsClient.extractKeyPhrases(keyPhrasesInput);          
        /*keyPhraseResult.forEach(document => {
            console.log(`ID: ${document.id}`);
            keyPhraseResponse = document.keyPhrases;
            console.log(`\tDocument Key Phrases: ${keyPhraseResponse}`);
        });*/      
        const headers = { 'Content-Type': 'application/json' };  
        res.headers = headers;                  
        res.send({ keyPhrasesExtracted: keyPhraseResponse });
    } catch (err) {
        console.log(err);
        res.status(401).send('There was an error authorizing your text analytics key. Check your text analytics service key or endpoint to the .env file.');
    }        
});




app.listen(port, () => {
  console.log(`Express backend app listening on port ${port}`)
})