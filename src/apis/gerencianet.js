const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Faz a leitura do certificado na pasta cert
const cert = fs.readFileSync(
  path.resolve(__dirname, `../../certs/${process.env.GN_CERT}`)
);

// Armazena o contrato no agent que sera passado na requisicao do axios
const agent = new https.Agent({
  pfx: cert,
  passphrase: ''
});

// Requisicao de autenticacao
const authenticate = ({ clientID, clientSecret }) => {
  // buffer.from transforma os dados no tipo informado, nesse caso, base64
  const credentials = Buffer.from(
    `${clientID}:${clientSecret}`
  ).toString('base64');

  return axios({
    method: 'POST',
    url: `${process.env.GN_ENDPOINT}/oauth/token`,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    httpsAgent: agent,
    data: {
      grant_type: 'client_credentials'
    }
  });
};

//Requisicao de cobranca
const GNRequest = async (credentials) => {
  const authResponse = await authenticate(credentials);
  const accessToken = authResponse.data?.access_token;

  return axios.create({
    baseURL: process.env.GN_ENDPOINT,
    httpsAgent: agent,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

module.exports = GNRequest;