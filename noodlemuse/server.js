import http from 'http';
import url from 'url';
import express from 'express';
import fetch from 'node-fetch';


function secret() {
    const CLIENT_ID = '1969d396ab164fb7834ca366b2ae4ec8';
    const CLIENT_SECRET = '70db1e28e4444e1198f2b9fd9484e8e1';
    const redirectUri = 'http://localhost:3000/callback';

    function getSecrets() {
        return {
            CLIENT_ID,
            CLIENT_SECRET,
            redirectUri
        }
    }
    return getSecrets;
}
const func1 = secret();
const secrets = func1();


function auth(res) {
    const scopes = 'user-read-private user-read-email playlist-read-private user-top-read';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${secrets.CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(secrets.redirectUri)}`
    res.writeHead(302, {
        'Location': authUrl
    });
    res.end();
}


async function getTokenData(code) {

    const searchParams = new URLSearchParams();
    searchParams.append('code', code);
    searchParams.append('redirect_uri', secrets.redirectUri);
    searchParams.append('grant_type', 'authorization_code');

    const postData = searchParams.toString();

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(secrets.CLIENT_ID + ':' + secrets.CLIENT_SECRET).toString('base64'))
        },
        body: postData
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', options);

        if (!response.ok) {
            throw new Error('Failed to retrieve token');
        }

        const tokenData = await response.json();
        return tokenData;
    } catch (error) {
        throw new Error('Error fetching token: ' + error.message);
    }

}

async function accToken(code, res) {
    try {
        const tokenData = await getTokenData(code)

        console.log('Token data:', tokenData);
        res.writeHead(302, {
            'Location': '/'
        })
        res.end()
        return tokenData;
    }
    catch (error) {
        console.error('Error getting token data:', error);
    };
}

async function topArtists(token) {
    console.log("tA function called",token.access_token);

    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token.access_token}`
        }
    }
    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/artists?time_range=short_term', options);
        console.log("response: ", response);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from Spotify API: ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Names in order:");
        for (let i = 0; i < data.items.length; i++) {
            console.log(`Artist at ${i + 1}: ${data.items[i].name}`);
        }
    }
    catch (error) {
        console.error('Error getting token data:', error);
    }
}

const app = express();
const server = http.createServer(async (req, res) => {
    const { pathname, query } = url.parse(req.url, true);
    var token;
    switch (pathname) {
        case '/': res.writeHead(200, { 'Content-type': 'text/plain' })
            console.log("Home page");
            res.end('Homepage')
            break;
        case '/authorize': auth(res)
            console.log("authorize initiated");
            break;
        case '/callback': console.log("callback initiated");
            console.log("Query parameters:", query)
            const code = query.code;
            token = await accToken(code, res);
            console.log("token in routes:", token);
            await topArtists(token); 
            break;
        default: res.writeHead(404, { 'Content-type': 'text/plain' });
            console.log("404 forced", pathname)
            res.end("404")
    }

})

server.listen(3000, () => {
    console.log("Listening");
})