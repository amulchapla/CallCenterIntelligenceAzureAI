import React from "react";
import Navbar from "react-bootstrap/Navbar";
import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";
import { Container } from "reactstrap";
// import { ConsoleLoggingListener } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/ConsoleLoggingListener";

/**
 * Renders the navbar component with a sign-in or sign-out button depending on whether or not a user is authenticated
 * @param props 
 */
export const PageLayout = (props) => {
    const isAuthenticated = useIsAuthenticated();
    const { REACT_APP_PLATFORM } = process.env;

    if (REACT_APP_PLATFORM === "hosted") {
        var isHosted = true;
    } else {
        var isHosted = false;
    }

    function DesktopLayout() {
        return <>{props.children}</>;
    }

    function HostedLayout() {
        
        return (
            <>
            <Container fluid>
            { isHosted ? <Navbar bg="dark" variant="dark">
                <Navbar.Brand>AI-Powered Call Center</Navbar.Brand>
                { isAuthenticated ? <SignOutButton /> : <SignInButton /> }
            </Navbar> : <p></p>}
            <br />
            </Container>
            { isAuthenticated ? <>{props.children}</> : <p></p> }
            </>
        )
    }

    function Layout() {

        if (isHosted) {
            return <HostedLayout />
        } else {
            return <DesktopLayout />
        }
    }

    return (
        <Layout />
    );
};
