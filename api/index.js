import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import {graphqlExpress, graphiqlExpress} from 'graphql-server-express';

import {Post} from './mongo/models';
import schema from './schema';
import config from './config/env';

const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const app = express();
// const {getTokenFromRequest} = require('./utils/auth');

Promise = require('bluebird'); // eslint-disable-line no-global-assign
mongoose.Promise = Promise;

app.use(bodyParser.json());

console.log('connecting to:...' + config.default.db);
mongoose.connect(config.default.db, (err) => {
    if (err) {
        console.error(`Unable to connect to database: ${config.default.db} on port 27017`);
    }
});

app.use(cors({
    credentials: true,
    origin: 'http://localhost:4200',
}));

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://sandropucp.auth0.com/.well-known/jwks.json',
    }),
    audience: 'https://blog-api.com',
    issuer: 'https://sandropucp.auth0.com/',
    algorithms: ['RS256'],
});

app.use(jwtCheck);

var ManagementClient = require('auth0').ManagementClient;

var auth0 = new ManagementClient({
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1qVkdOREV3UlRVMU5qTkZPVVJEUkVNeU5qSXdORE0zUXpCR01FVkJRa1ZGTXpoRk1EZzROUSJ9.eyJpc3MiOiJodHRwczovL3NhbmRyb3B1Y3AuYXV0aDAuY29tLyIsInN1YiI6Im9KNGxzaXE1SWx0MVVCWGVkUlBhaWpMS3oyZE82Um51QGNsaWVudHMiLCJhdWQiOiJodHRwczovL3NhbmRyb3B1Y3AuYXV0aDAuY29tL2FwaS92Mi8iLCJleHAiOjE0OTk1NDg1MTMsImlhdCI6MTQ5OTQ2MjExMywic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBjcmVhdGU6dXNlcl90aWNrZXRzIHJlYWQ6Y2xpZW50cyB1cGRhdGU6Y2xpZW50cyBkZWxldGU6Y2xpZW50cyBjcmVhdGU6Y2xpZW50cyByZWFkOmNsaWVudF9rZXlzIHVwZGF0ZTpjbGllbnRfa2V5cyBkZWxldGU6Y2xpZW50X2tleXMgY3JlYXRlOmNsaWVudF9rZXlzIHJlYWQ6Y29ubmVjdGlvbnMgdXBkYXRlOmNvbm5lY3Rpb25zIGRlbGV0ZTpjb25uZWN0aW9ucyBjcmVhdGU6Y29ubmVjdGlvbnMgcmVhZDpyZXNvdXJjZV9zZXJ2ZXJzIHVwZGF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGRlbGV0ZTpyZXNvdXJjZV9zZXJ2ZXJzIGNyZWF0ZTpyZXNvdXJjZV9zZXJ2ZXJzIHJlYWQ6ZGV2aWNlX2NyZWRlbnRpYWxzIHVwZGF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgZGVsZXRlOmRldmljZV9jcmVkZW50aWFscyBjcmVhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIHJlYWQ6cnVsZXMgdXBkYXRlOnJ1bGVzIGRlbGV0ZTpydWxlcyBjcmVhdGU6cnVsZXMgcmVhZDplbWFpbF9wcm92aWRlciB1cGRhdGU6ZW1haWxfcHJvdmlkZXIgZGVsZXRlOmVtYWlsX3Byb3ZpZGVyIGNyZWF0ZTplbWFpbF9wcm92aWRlciBibGFja2xpc3Q6dG9rZW5zIHJlYWQ6c3RhdHMgcmVhZDp0ZW5hbnRfc2V0dGluZ3MgdXBkYXRlOnRlbmFudF9zZXR0aW5ncyByZWFkOmxvZ3MgcmVhZDpzaGllbGRzIGNyZWF0ZTpzaGllbGRzIGRlbGV0ZTpzaGllbGRzIHVwZGF0ZTp0cmlnZ2VycyByZWFkOnRyaWdnZXJzIHJlYWQ6Z3JhbnRzIGRlbGV0ZTpncmFudHMgcmVhZDpndWFyZGlhbl9mYWN0b3JzIHVwZGF0ZTpndWFyZGlhbl9mYWN0b3JzIHJlYWQ6Z3VhcmRpYW5fZW5yb2xsbWVudHMgZGVsZXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGNyZWF0ZTpndWFyZGlhbl9lbnJvbGxtZW50X3RpY2tldHMgcmVhZDp1c2VyX2lkcF90b2tlbnMgY3JlYXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgZGVsZXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IifQ.TgdCBSwae0rV8jzUBTuBm50uN-W6_AuNYcNM4dZU3t-8-T7vtrU8l9aiBAtV15JQiSyXnEpYl82VLvvuN9jDPrf7Js4wvAti8AXgLhMd9d9PbvHFFesCB2T2SnQi0Ys4R6voXIIiUzeJhsTSrNUMEdFlmE05XfgnrmTtl_V4-_o3kVcYigV6qBzG3y7KUAjDPEzU_m_rUV9PMvzLaICGkc2uSLjN91DseHQkMrXUL6XfxpJd-kFmZHAk5YxFybMagkZt6YAgFZwVPo_tCKVeIWlfOVYuhEA6EAej0IaCUdIX2LbiOK2hbRalQEzdJTXplGV9yw-lnqNPogHhbxUm6w',
    domain: 'sandropucp.auth0.com',
    telemetry: false,
});

var test = auth0
    .getUsers()
    .then(function (users) {
        console.log('Test');
        console.log(users);
    })
    .catch(function (err) {
        console.log(err);
    });


app.use('/graphql', graphqlExpress((req) => {
    const token = req.header('authorization');
    const user = req.user;
    const token1 = test;
    console.log('TOKEN:' + token1);
    return {
        schema,
        context: {
            token,
            user,
            Post,
        },
        graphiql: true,
    };
}));

const initialVariables = {limit: 10, skip: 0};

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    query: `
query Blog($limit: Int, $skip: Int){
  getPosts(limit:$limit, skip:$skip) {
    tags
    title
    body
  	author
  }
}        
  `,
    variables: initialVariables,
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(config.default.port, () =>
    console.log(`API Server is now running on http://localhost:${config.default.port}`));
