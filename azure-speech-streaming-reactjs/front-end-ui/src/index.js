import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from "./styles/theme";
import { MsalProvider } from "@azure/msal-react";


// MSAL Imports
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

// MSAL configuration
const msalInstance = new PublicClientApplication(msalConfig);

// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  // Account selection logic is app dependent. Adjust as needed for different use cases.
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

// Optional - This will update account state if a user signs in from another tab or window
msalInstance.enableAccountStorageEvents();

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    const account = event.payload.account;
    msalInstance.setActiveAccount(account);
  }
});


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <MsalProvider instance={msalInstance}>
        <App/>
        </MsalProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);


