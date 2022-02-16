import React from "react";
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export const OutputWindows = (props) => {
    return (
      <Container fluid>
      <Row>
        <Col>
          <Card bg="secondary" border="primary" style={{ height: '275px'}}>
            <Card.Body>
            <Card.Header>Profile:</Card.Header>
            <Card.Text>{props.profile}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="secondary" border="primary" style={{ height: '275px'}}>
            <Card.Body>
            <Card.Header>Dashboard</Card.Header>
            <Card.Text>{props.dashboard}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
        <Card text="success" bg="dark" border="primary" style={{ height: '600px'}}>
          <Card.Body>
          <Card.Header>Transcription Output Window:</Card.Header>
          <Card.Text>{props.text}</Card.Text>
          </Card.Body>
        </Card>
        </Col>
        <Col>
        <Card text="success" bg="dark" border="primary" style={{ height: '600px'}}>
          <Card.Body>
          <Card.Header>NLP Output Window:</Card.Header>
          <Card.Text>{props.nlpOutput}</Card.Text>
          </Card.Body>
        </Card>
        </Col>
      </Row>
      <Row>
        <Col>
        <Card text="success" bg="dark" border="danger" style={{ height: '200px' }}>
          <Card.Body>
          <Card.Header>Debug Console Window:</Card.Header>
          <Card.Text>{props.debugData}</Card.Text>
          </Card.Body>
        </Card>
        </Col>
       </Row>
      </Container>
    );
};