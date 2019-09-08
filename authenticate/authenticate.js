'use strict';
const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const clients = require('./clients-db');

const app = express();
const port = 3001;
const saltRounds = 10;
const authDB = [];
const defaultErrorMessage = "Error: Please check the console.";

// Accept Content-Type: application/json
app.use(express.json());

app.post('/authenticate', async (req, res) => {
    try {
        if (await isValidClient(req.body)) {
            res.send({ result: true });
        } else {
            res.send({ result: false });
        }
    } catch (err) {
        console.log(err);
        res.send(defaultErrorMessage);
    }
});

/**
 * Compare the hash of the client's password received in request
 * with stored hashed client password in DB if client exists
 * @param {Object} client | JSON object containing client's credentials 
 * @returns {boolean} | Based on if authentication was successful or not
 */
function isValidClient(client) {
    const clientInDB = _.find(authDB, { 'id': client.id });
    if (clientInDB) {
        return bcrypt.compare(client.password,
            clientInDB.password).then((res) => {
                return res;
            });
    } else {
        return false;
    }
}

/**
 * Iterate over clients, store their credentials in DB with password hashed
 */
function createAuthDB() {
    clients.forEach(client => {
        bcrypt.hash(client.password, saltRounds, (err, hash) => {
            if (err) {
                console.log(err);
            } else {
                authDB.push({
                    id: client.id,
                    password: hash
                });
            }
        });
    });
}

app.listen(port, () => {
    console.log(`Authenticate app listening on port ${port}!`);
    createAuthDB();
});

//TODO: Separate functions and routes in different files