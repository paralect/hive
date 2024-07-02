const React = require('react');
const { Html, Head, Body, Container, Heading, Text } = require('@react-email/components');

const MyEmailComponent = ({ name }) => (
  <Html>
    <Head />
    <Body>
      <Container>
        <Heading>Hello, {name}!</Heading>
        <Text>This is a test email using @react-email and Express.</Text>
      </Container>
    </Body>
  </Html>
);

module.exports = { MyEmailComponent };