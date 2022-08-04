/* eslint-disable @typescript-eslint/no-var-requires */
const sslCertificate = require('get-ssl-certificate');
const fetch = require('node-fetch');
const { X509Certificate } = require('crypto');

function splitSubject(subject) {
  return subject.split('\n').reduce((subject, part) => {
    const [term, value] = part.split('=', 2);
    if (term in subject) {
      subject[term] = Array.isArray(subject[term])
        ? [...subject[term], value]
        : [subject[term], value];
    } else {
      subject[term] = value;
    }
    return subject;
  }, {});
}

/**
 * Take a standard X509Certificate object and convert to a JSON object following the
 * formatting of `sslCertificate.get()` and `tlsSocket.getPeerCertificate()`.
 *
 * See: https://nodejs.org/dist/latest-v16.x/docs/api/tls.html#certificate-object
 */
function certificateToJson(cert) {
  const json = cert.toLegacyObject();
  json.subject = splitSubject(json.subject);
  json.issuer = splitSubject(json.issuer);
  json.pemEncoded = cert.toString();
  return json;
}

async function getCertificate(req, res) {
  const { providerType, hostname } = req.query;

  if (providerType === 'vsphere') {
    // get the certificate used on the SSL connection to the host
    try {
      const certificate = await sslCertificate.get(hostname, 250, 443, 'https:');
      console.info(`Fetched certificate: ${hostname}`);
      return res.status(200).json(certificate);
    } catch (error) {
      console.error(`Error: Fetch certificate`, error.message);
      if (error.code === 'ENOTFOUND') {
        return res.status(404).json('URL not found');
      }
      return res.status(500).json('Fetch certificate failed');
    }
  } else if (providerType === 'ovirt') {
    // get the CA certificate from the ovirt provided endpoint
    const url = `https://${hostname}/ovirt-engine/services/pki-resource?resource=ca-certificate&format=X509-PEM-CA`;
    try {
      const response = await fetch(url);
      const certX509 = await response.text();
      const cert = certificateToJson(new X509Certificate(certX509));
      console.info(
        `Fetched CA certificate from: ${hostname}, Subject: ${JSON.stringify(cert.subject)}`
      );
      return res.status(200).json(cert);
    } catch (error) {
      console.error(`Error: Fetch certificate`, error.message);
      if (error.code === 'ENOTFOUND') {
        return res.status(404).json('URL not found');
      }
      return res.status(500).json('Fetch certificate failed');
    }
  } else {
    return res.status(500).json('Unknown providerType');
  }
}

module.exports = {
  apply(expressApp) {
    expressApp.get('/get-certificate', getCertificate);
  },
};
