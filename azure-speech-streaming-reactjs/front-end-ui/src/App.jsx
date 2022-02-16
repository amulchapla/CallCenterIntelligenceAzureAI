import React, { Component } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { PageLayout } from "./components/PageLayout";
import { OutputWindows } from "./components/OutputWindows";
import { getKeyPhrases, getTokenOrRefresh } from './token_util.js';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { Dashboard } from "./components/Dashboard.jsx";
import { ProfileContent } from "./components/Profile.jsx";

//Set Config
const speechsdk = require('microsoft-cognitiveservices-speech-sdk')


// Start App
export default class App extends Component {
  constructor(props) {
      super(props);

      this.handleMicRecorderClick = this.handleMicRecorderClick.bind(this);
      this.handleAudioRecordingSwitch = this.handleAudioRecordingSwitch.bind(this);

      this.state = {
        accessToken: null,
        AudioRecordingEnabled: true,
        isStreaming: false,
        isHosted: false,
        color: 'white',
        value: '', 
        displayText: 'Transcribed text will show here when streaming.',
        displayNLPOutput: 'This windows will display detected entities.',
        debugConsole: 'Debug logs will be displayed here.'
      };
  }

  async handleMicRecorderClick(accessToken) {

    if (this.state.isStreaming) {
      this.setState({debugConsole : 'Stop Mic Event Received'})
      await this.setState({isStreaming: false})
      return null
    } else {
      await this.setState({isStreaming: true})
    }
    
    const delay = ms => new Promise(res => setTimeout(res, ms));
      const recognizer = await this.InitializeStream(accessToken);
      await this.sttFromMic(recognizer, accessToken);
      await delay(2000);
      do {
        this.setState({debugConsole : "Mic is listening for audio."})
        this.setState({debugConsole : "Will check every 2 seconds for stop event"})
        await delay(2000);
      }
      while (this.state.isStreaming);
      await this.stopMicStream(recognizer);
    }


  handleAudioRecordingSwitch = () => {

    if (this.state.AudioRecordingEnabled) {
      this.setState({AudioRecordingEnabled: false})
    } else {
      this.setState({AudioRecordingEnabled: true})
    }

  }

  async componentDidMount() {
  }


async InitializeStream(accessToken) {
    const tokenObj = await getTokenOrRefresh(accessToken);
    const customSpeechEndpoint = tokenObj.endpoint_id
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    if (this.state.AudioRecordingEnabled) {

      //Setting below specifies custom speech model ID that is created using Speech Studio
      speechConfig.endpointId = customSpeechEndpoint;

      //Setting below allows specifying custom GUID that can be used to correlate audio captured by Speech Logging
      speechConfig.setServiceProperty("clientConnectionId", this.state.value, speechsdk.ServicePropertyChannel.UriQueryParameter);
          
    }
    speechConfig.speechRecognitionLanguage = 'en-US';
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
    return recognizer
    
  };

  async stopMicStream(recognizer) {
    await recognizer.stopContinuousRecognitionAsync();
    await this.setState({isStreaming : false});
    this.setState({debugConsole : 'Mic stopped listening'});
  }


  async sttFromMic(recognizer, accessToken) {

    let resultText = "";
    let nlpText = " ";

    recognizer.sessionStarted = (s, e) => {
      resultText = "Session ID: " + e.sessionId;
      this.setState({
        displayText: resultText
      });
    };

    recognizer.recognized = async (s, e) => {

      if(e.result.reason === ResultReason.RecognizedSpeech){
              //Display continuous transcript
              resultText += `\n${e.result.text}`;    
              this.setState({
                displayText: resultText
              });      
              
              //Perform continuous NLP
              const nlpObj = await getKeyPhrases(e.result.text, accessToken);              
                  
              //Display extracted Key Phrases      
              const keyPhraseText = JSON.stringify(nlpObj.keyPhrasesExtracted);
              
              if(keyPhraseText.length > 15){
                  nlpText += "\n" + keyPhraseText;
                  this.setState({ displayNLPOutput: nlpText }); 
              }        

              //Display extracted entities
              const entityText = JSON.stringify(nlpObj.entityExtracted); 

              if(entityText.length > 12){
                  nlpText += "\n" + entityText;
                  this.setState({ displayNLPOutput: nlpText.replace('<br/>', '\n') });
              }          
          }

          else if (e.result.reason === ResultReason.NoMatch) {
              //resultText += `\nNo Match`
              resultText += `\n`
          }          
    };
    await recognizer.startContinuousRecognitionAsync();
    await this.setState({isStreaming : true});
}

  render() {
    return (
      <>
      <PageLayout>
        <AuthenticatedTemplate>
          <OutputWindows profile={<ProfileContent processAccessToken={this.processAccessToken}/>} debugData={this.state.debugConsole} nlpOutput={this.state.displayNLPOutput} text={this.state.displayText} dashboard={<Dashboard isStreaming={this.state.isStreaming} AudioEnabled={this.state.AudioRecordingEnabled} onToggleClick={this.handleAudioRecordingSwitch} onMicRecordClick={this.handleMicRecorderClick}/>} />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <OutputWindows profile={<ProfileContent/>} debugData={this.state.debugConsole} nlpOutput={this.state.displayNLPOutput} text={this.state.displayText} dashboard={<Dashboard isStreaming={this.state.isStreaming} AudioEnabled={this.state.AudioRecordingEnabled} onToggleClick={this.handleAudioRecordingSwitch} onMicRecordClick={this.handleMicRecorderClick}/>} />
        </UnauthenticatedTemplate>
      </PageLayout>
      </>
    );
  }
}
