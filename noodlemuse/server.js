const http = require('http');
// const fetch= require('node-fetch');

// const encAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const CLIENT_SECRET='70db1e28e4444e1198f2b9fd9484e8e1';

function auth(res){
    const CLIENT_ID='1969d396ab164fb7834ca366b2ae4ec8';
    const redirectUri = 'http://localhost:3000/';
    const scopes = 'user-read-private user-read-email playlist-read-private';
    const authUrl=`https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`
    res.writeHead(302,{
        'Location':authUrl
    });
    res.end("Authorization worked");
}

const server = http.createServer((req, res)=>{
    const {url, method}= req;
    let content= "This text was processed successfully"
    switch (url){
        case '/': res.writeHead(200,{'Content-type':'text/plain'})
        console.log("Home page");
        res.end('Homepage')
        break;
        case '/authorize': auth(res)
        break;
        default: res.writeHead(404,{'Content-type':'text/plain'});
                 res.end("404")
    }

})

server.listen(3000, ()=>{
    console.log("Listening");
})
