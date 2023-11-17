const http = require('http');
const url = require('url');
import fetch from 'node-fetch'
const querystring = require('querystring');


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
    const scopes = 'user-read-private user-read-email playlist-read-private';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${secrets.CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(secrets.redirectUri)}`
    res.writeHead(302, {
        'Location': authUrl
    });
    res.end();
}



// function accToken(code) {

//     const options = {
//         hostname: 'accounts.spotify.com',
//         path: '/api/token',
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Authorization': 'Basic ' + (Buffer.from(secrets.CLIENT_ID + ':' + secrets.CLIENT_SECRET).toString('base64'))
//         }

//     }

//     const postData = querystring.stringify({
//         code: code,
//         redirect_uri: secrets.redirectUri,
//         grant_type: 'authorization_code'
//     })
//     const req = http.request(options,(response)=>{
//         let data='';

//         response.on('data',(chunk)=>{
//             data+=chunk;
//             console.log('Received data chunk:', chunk);
//         })

//         // response.on('end',()=>{
//         //     const tokenData= JSON.parse(data);
//         //     console.log('Token data is:',tokenData)
//         // })

//         response.on('end', () => {
//             try {
//                 // const tokenData = JSON.parse(data);
//                 console.log('Token data is:', data);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 // Handle JSON parsing error here
//             }
//         });
//     })

//     req.on('error',(error)=>{
//         console.log("request error:",error)
//     })

//     req.write(postData);
//     req.end();

// }



async function getTokenData(code) {

    const options = {
        hostname: 'accounts.spotify.com',
        path: '/api/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(secrets.CLIENT_ID + ':' + secrets.CLIENT_SECRET).toString('base64'))
        }

    }

    const searchParams = new URLSearchParams();
    searchParams.append('code', code);
    searchParams.append('redirect_uri', secrets.redirectUri);
    searchParams.append('grant_type', 'authorization_code');

    const postData = searchParams.toString();

    const req = http.request(options, (response) => {
        let data = Buffer.from([]);

        response.on('data', (chunk) => {
            data = Buffer.concat([data, chunk]);
            console.log("chunk:", chunk)
            resolve(data)
        });

        response.on('end', () => {
            try {
                console.log("End event log:", data);
                resolve(data);
                const tokenData = data;
            } catch (error) {
                reject(error);
            }
        });

        response.on('error', (error) => {
            reject(error);
        });
    });

    req.on('error', (error) => {
        reject(error);
    });

    req.write(postData);
    req.end();

}

function accToken(code, res) {
    getTokenData(code)
        .then((tokenData) => {
            // Perform actions with tokenData here before redirecting
            console.log('Token data:', tokenData);

            res.writeHead(302, {
                'Location': '/'
            })
            res.end()
            // Redirect to homepage or perform other actions
            // For example:
            // res.writeHead(302, { 'Location': '/' });
            // res.end();
        })
        .catch((error) => {
            console.error('Error getting token data:', error);
            // Handle errors here
        });
}








const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url, true);
    let content = "This text was processed successfully"
    switch (pathname) {
        case '/': res.writeHead(200, { 'Content-type': 'text/plain' })
            console.log("Home page");
            res.end('Homepage')
            break;
        case '/authorize': auth(res)
            break;
        case '/callback': console.log("callback initiated");
            console.log("Query parameters:", query)
            const code = query.code;
            accToken(code, res);
            // res.writeHead(302, {
            //     'Location': '/'
            // })
            // res.end()
            break;
        default: res.writeHead(404, { 'Content-type': 'text/plain' });
            console.log("404")
            res.end("404")
    }

})

server.listen(3000, () => {
    console.log("Listening");
})