import bodyParser from 'body-parser';
import express from 'express';
import basicAuth from 'express-basic-auth';
import path from 'path';
import config from '../license.config';
import LicenseManager from './licenses';

const AUTH = config.pass;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.text());

const adminAuth = basicAuth({
  users: {
    admin: AUTH
  }
});

const port = process.env.PORT || 8000;

app.post('/generate', adminAuth, (req, res) => {
  const { user, meta, expiration } = req.body.data;
  const license = LicenseManager.generate(user, meta, expiration);

  res.send(license);
});

app.post('/validate', (req, res) => {
  const userData = LicenseManager.validate(req.body);
  res.json(userData);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// @ts-ignore
app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});
