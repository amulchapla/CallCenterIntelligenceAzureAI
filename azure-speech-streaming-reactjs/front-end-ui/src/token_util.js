import axios from 'axios';
import Cookie from 'universal-cookie';
const BACKEND_API = process.env.REACT_APP_BACKEND_API

export async function getTokenOrRefresh(accessToken) {
    const cookie = new Cookie();
    const speechToken = cookie.get('speech-token');
    

    if (speechToken === undefined) {
        try {

            console.log('Try getting token from the express backend');
            const headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'Access-Control-Allow-Origin': '*'}
            console.log(headers)
            const res = await axios.get(BACKEND_API + '/api/get-speech-token', {headers});
            const token = res.data.token;
            const region = res.data.region;
            const endpoint_id = res.data.endpoint_id
            cookie.set('speech-token', region + ':' + token, {maxAge: 540, path: '/'});

            console.log('Token fetched from back-end: ' + token);
            return { authToken: token, region: region, endpoint_id: endpoint_id };
        } catch (err) {
            console.log(err.response.data);
            return { authToken: null, error: err.response.data };
        }
    } else {
        console.log('Token fetched from cookie: ' + speechToken);
        const idx = speechToken.indexOf(':');
        return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
    }
}

export async function getKeyPhrases(requestText, accessToken) {     
    try{
        //Key Phrase extraction
        const data = {transcript: requestText};
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`};
        const res = await axios.post(BACKEND_API + '/api/ta-key-phrases', data, {headers});                
        
        return res.data;
        //return {keyPhrasesExtracted: keyPhrasesExtracted};
    } catch (err) {       
        return {keyPhrasesExtracted: "NoKP", entityExtracted: "NoEnt"};
    }

}

export async function getKeyPhrasesOld(requestText, accessToken) {      

    try{
        //Key Phrase extraction
        const data = {transcript: requestText};
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`};
        
        const res = await axios.post('/api/ta-key-phrases', data, {headers});    
        //const keyPhrasesExtracted = JSON.stringify(res.body.keyPhraseResponse);        
        
        return res.data;
        //return {keyPhrasesExtracted: keyPhrasesExtracted};
    } catch (err) {       
        return {keyPhrasesExtracted: "None"};
    }
}