const express = require('express');
const bodyParser = require('body-parser'); 
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Генерация ключей для ЭЦП
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

let randomMessage = ''; // Случайное сообщение, которое клиент должен подписать

app.get('/publicKey', (req, res) => {
  res.send(publicKey);
});

app.post('/signMessage', (req, res) => {
  const messageToSign = req.body.message;

  if (!messageToSign) {
    return res.status(400).json({ error: 'Missing message in request body' });
  }

  const sign = crypto.createSign('SHA256');
  sign.update(messageToSign);
  const signature = sign.sign(privateKey, 'base64');

  res.json({ signature });
});

app.post('/verifySignature', (req, res) => {
  const signedMessage = req.body.signedMessage;
  const signature = req.body.signature;
  const clientPublicKey = req.body.publicKey;

  if (!signedMessage || !signature || !clientPublicKey) {
    return res.status(400).json({ error: 'Missing required data in request body' });
  }

  const verifier = crypto.createVerify('SHA256');
  verifier.update(signedMessage);

  const isValid = verifier.verify(clientPublicKey, signature, 'base64');

  res.json({ isValid });
});

app.get('/generateRandomMessage', (req, res) => {
  randomMessage = crypto.randomBytes(32).toString('hex');
  res.json({ randomMessage });
});

app.post('/verifyRandomMessageSignature', (req, res) => {
  const randomMessageToVerify = req.body.message;
  const clientPublicKey = req.body.publicKey;
  const signature = req.body.signature;

  if (!randomMessageToVerify || !clientPublicKey || !signature) {
    return res.status(400).json({ error: 'Missing required data in request body' });
  }

  const verifier = crypto.createVerify('SHA256');
  verifier.update(Buffer.from(randomMessageToVerify, 'utf-8'));

  const isValid = verifier.verify(clientPublicKey, signature, 'base64');

  res.json({ isValid });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
