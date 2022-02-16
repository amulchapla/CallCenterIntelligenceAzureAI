import { useMsal} from "@azure/msal-react";
import Button from "react-bootstrap/Button";
import { loginRequest } from "../authConfig";
import { useState, useEffect } from "react";

export const ProfileContent = (props) => {
    const { instance, accounts } = useMsal();
    const [accessToken, setAccessToken] = useState(null);
    const { REACT_APP_PLATFORM } = process.env;

    if (REACT_APP_PLATFORM === "hosted") {
        var isHosted = true;
    } else {
        var isHosted = false;
    }

    function RequestAccessToken() {
        const request = {
            ...loginRequest,
            account: accounts[0]
        };
        //silently acquire an access token
        instance.acquireTokenSilent(request).then((response) => {
            setAccessToken(response.accessToken);
        }).catch((e) => {
            instance.acquireTokenPopup(request).then((response) => {
                setAccessToken(response.accessToken);
            });
        });

    }


    if (isHosted) {
        return (
            <>
                <table>
                  <h5 className="card-title">Welcome {accounts[0].name}</h5>
                  {accessToken ? 
                    <p>Access Token Acquired!</p>
                    :
                    <Button variant="secondary" onClick={RequestAccessToken}>Request Access Token</Button>
                    }
                </table>
            </>
        );
        } else {
            return (
            <>
                <table>
                    <h5 className="card-title">Welcome, Demo User!</h5>
                </table>
            </>
            )
        }
  };