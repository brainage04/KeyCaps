const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const credentials = require('./credentials.json');

// Replace with the code you received from Google
const code = '4/0AfgeXvug7g2Y22Zt7JjeFCor0_MmbyOl2ckRRHo7Svy3SfOuvLNh8AEzNYnt519nVGKvhg';
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

oAuth2Client.getToken(code).then(({ tokens }) => {
	const tokenPath = path.join(__dirname, 'tokens.json');
	fs.writeFileSync(tokenPath, JSON.stringify(tokens));
	console.log('Access token and refresh token stored to tokens.json');
});