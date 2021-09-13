import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getTokenOrRefresh } from './token_util.js';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import './App.css';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

export default class App extends Component {
  constructor(props) {
      super(props);

      this.state = {value: ''};

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

      this.state = {
          displayText: 'INITIALIZED: ready to test speech...'
      }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('Your conversation will be saved with name : ' + this.state.value + ' Submit a different name to change it.');
    event.preventDefault();
  }

  async componentDidMount() {
      // check for valid speech key/region
      const tokenRes = await getTokenOrRefresh();
      if (tokenRes.authToken === null) {
          this.setState({
              displayText: 'FATAL_ERROR amc: ' + tokenRes.error
          });
      }
  }

  async sttFromMic() {
      const tokenObj = await getTokenOrRefresh();
      //const customSpeechEndpoint = process.env.CUSTOM_SPEECH_ENDPOINT_ID;
      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
      speechConfig.speechRecognitionLanguage = 'en-US';

      //Setting below specifies custom speech model ID that is created using Speech Studio
      speechConfig.endpointId = '5c0e6aec-f9b6-4da5-9228-a02b17d7a749';

      //Setting below allows specifying custom GUID that can be used to correlnpate audio captured by Speech Logging
      speechConfig.setServiceProperty("clientConnectionId", this.state.value, speechsdk.ServicePropertyChannel.UriQueryParameter);

      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);


      this.setState({
          displayText: 'Speak into your microphone to start conversation...' + this.state.value
      });

      // recognizer.recognizeOnceAsync(result => {
      //     let displayText;
      //     if (result.reason === ResultReason.RecognizedSpeech) {
      //         displayText = `RECOGNIZED: Text=${result.text}`
      //     } else {
      //         displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
      //     }

      //     this.setState({
      //         displayText: displayText
      //     });
      // });

      let resultText = "";
      recognizer.sessionStarted = (s, e) => {
          resultText = "Session ID: " + e.sessionId;

          this.setState({
              displayText: resultText
          });
      };

      // recognizer.recognizing = (s, e) => {

      // };

      recognizer.recognized = (s, e) => {
          if(e.result.reason === ResultReason.RecognizedSpeech){
              resultText += `\n${e.result.text}`
          }
          else if (e.result.reason === ResultReason.NoMatch) {
              resultText += `\nNo Match`
          }

          this.setState({
              displayText: resultText
          });
      };

      recognizer.startContinuousRecognitionAsync();
  }

  async fileChange(event) {
      const audioFile = event.target.files[0];
      console.log(audioFile);
      const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

      this.setState({
          displayText: fileInfo
      });

      const tokenObj = await getTokenOrRefresh();
      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
      speechConfig.speechRecognitionLanguage = 'en-US';

      const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
      const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync(result => {
          let displayText;
          if (result.reason === ResultReason.RecognizedSpeech) {
              displayText = `RECOGNIZED: Text=${result.text}`
          } else {
              displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
          }

          this.setState({
              displayText: fileInfo + displayText
          });
      });
  }




  render() {
      return (
          <Container className="app-container">
              <h3 className="display-4 mb-3">Realtime Call Intelligence Simulation-Azure AI</h3>
              <h3 className="display-4 mb-3">---This covnersation will be recorded for demo---</h3>

              <form onSubmit={this.handleSubmit}>
                    <label>
                    STEP 1 - Enter a Name for this Conversation (without spaces) :
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="Submit" />
              </form>

              <div className="row main-container">
                  <div className="col-6">
                      <i className="fas fa-microphone fa-lg mr-2" onClick={() => this.sttFromMic()}></i>
                      STEP 2 - Click on Microphone and start talking for live transcription..

                      <div className="mt-2">
                          <label htmlFor="audio-file"><i className="fas fa-file-audio fa-lg mr-2"></i></label>
                          <input
                              type="file"
                              id="audio-file"
                              onChange={(e) => this.fileChange(e)}
                              style={{display: "none"}}
                          />
                          Convert speech to text from an audio file.
                      </div>
                  </div>
                  <div className="col-6 output-display rounded">
                      <code>{this.state.displayText}</code>
                  </div>
              </div>
          </Container>
      );
  }
}