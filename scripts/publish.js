const fs = require('fs');
const zipFolder = require('zip-folder');
const https = require('https');
var querystring = require('querystring');

const {
    PUBLISH_EXTENSION_ID,
    PUBLISH_CLIENT_ID,
    PUBLISH_CLIENT_SECRET,
    PUBLISH_REFRESH_TOKEN
} = process.env;

const distDir = './dist';
const distZip = './tmp/dist.zip';

zip(distDir, distZip)
    .then(() =>
        request(
            'POST',
            '/oauth2/v4/token',
            'application/x-www-form-urlencoded',
            querystring.stringify({
                client_id: PUBLISH_CLIENT_ID,
                client_secret: PUBLISH_CLIENT_SECRET,
                refresh_token: PUBLISH_REFRESH_TOKEN,
                grant_type: 'refresh_token'
            })
        )
    )
    .then(({ access_token }) =>
        request(
            'PUT',
            `/upload/chromewebstore/v1.1/items/${PUBLISH_EXTENSION_ID}`,
            'application/octet-stream',
            fs.readFileSync(distZip),
            { Authorization: `Bearer ${access_token}` }
        )
            .then(console.log)
            .then(() =>
                request(
                    'POST',
                    `/chromewebstore/v1.1/items/${PUBLISH_EXTENSION_ID}/publish`,
                    'application/json',
                    '{}',
                    { Authorization: `Bearer ${access_token}` }
                )
            )
            .then(console.log)
    )
    .catch(err => console.error('Upload failed', err));

function zip(folderPath, destPath) {
    return new Promise((resolve, reject) => {
        zipFolder(folderPath, destPath, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function request(method, path, contentType, payload, headers = {}) {
    return new Promise((resolve, reject) => {
        if (payload) {
            headers['Content-Type'] = contentType;
            headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = https.request(
            { method, hostname: 'www.googleapis.com', path, headers },
            resp => {
                let data = '';
                resp.on('data', chunk => {
                    data += chunk;
                });
                resp.on('end', () => {
                    const json = JSON.parse(data);
                    if (resp.statusCode !== 200) {
                        reject(json);
                    } else if (json.error) {
                        reject(json);
                    } else {
                        resolve(json);
                    }
                });
            }
        );

        req.on('error', reject);

        if (payload) {
            req.end(payload);
        } else {
            req.end();
        }
    });
}
