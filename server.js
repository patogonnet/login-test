const express = require('express');
const axios = require('axios');
const qs = require('qs');
const keycloak_ = require('./keycloak.json')

const app = express();
const port = process.env.PORT || 3000;

const keycloak = keycloak_

const keycloakConfig = {
  realm: keycloak['realm'],
  authServerUrl: keycloak['auth-server-url'],
  clientId: keycloak.resource,
  clientSecret: keycloak.credentials['secret'],
  redirectUri: process.env.REDIRECT_URI || "http://localhost:3000/callback"
};


app.get('/login', (req, res) => {
  const authUrl = `${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?client_id=${keycloakConfig.clientId}&redirect_uri=${encodeURIComponent(keycloakConfig.redirectUri)}&response_type=code`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;

  const tokenUrl = `${keycloakConfig.authServerUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;
  const data = {
    grant_type: 'authorization_code',
    client_id: keycloakConfig.clientId,
    client_secret: keycloakConfig.clientSecret,
    code: code,
    redirect_uri: keycloakConfig.redirectUri
  };

  try {
    const response = await axios.post(tokenUrl, qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    //const token = response.data.access_token;
    res.send(response.data);
  } catch (error) {
    console.error('Error obtaining token:', error.response ? error.response.data : error.message);
    res.send('Error obtaining token');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/login`);
});