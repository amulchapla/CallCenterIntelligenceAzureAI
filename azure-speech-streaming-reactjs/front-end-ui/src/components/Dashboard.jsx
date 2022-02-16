import Button from 'react-bootstrap/Button';
import { loginRequest } from "../authConfig";
import { useMsal} from "@azure/msal-react";
import { useState, useEffect } from "react";

export const Dashboard = (props) => {
    let record_status = "enabled."
    let verb = "enable"
    const { instance, accounts } = useMsal();
    const [accessToken, setAccessToken] = useState(null);

    if (props.AudioEnabled) {
        record_status = "enabled."
        verb = "disable"
    } else {
        record_status = "disabled."
        verb = "enable"
    }

    let message = "Click here to " + verb + "."
    let button_message = "Start Mic Streaming"
    let button_variant = "primary"
    if (props.isStreaming) {
        button_message = "Stop Mic Streaming"
        button_variant = "danger"
    } else {
        button_message = "Start Mic Streaming"
        button_variant = "primary"
    }

    function RequestAccessToken() {
        const request = {
            ...loginRequest,
            account: accounts[0],
            scopes: [ "api://6798e375-a31f-48b0-abcb-87f06d70d0b6/user_impersonation" ]
        };
        instance.acquireTokenSilent(request).then((response) => {
            setAccessToken(response.accessToken);
        }).catch((e) => {
            instance.acquireTokenPopup(request).then((response) => {
                setAccessToken(response.accessToken);
            });
        });
    }

    function ClickHandler() {
        if (process.env.REACT_APP_PLATFORM === "hosted") {
        RequestAccessToken()
        } else {
            setAccessToken("fake_token")
        }
    }

    useEffect( () => {
        if (accessToken) {
            props.onMicRecordClick(accessToken)
        } 
    }, [accessToken])

    return(
        <>
            <table>
                <tr height="100">
                    <td><strong>Audio Recording is {record_status}</strong></td>
                    <td><Button onClick={props.onToggleClick}>{message}</Button></td>
                </tr>
                <tr height="100">
                    <td><strong>Start Or Stop Streaming</strong></td>
                    <td><Button variant={button_variant} onClick={ClickHandler}>{button_message}</Button></td>
                </tr>
            </table>
        </>
    )
};