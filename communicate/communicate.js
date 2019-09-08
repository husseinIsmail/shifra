'use strict';
const express = require('express');
const app = express();
const port = 3000;
const request = require('request-promise-native');
const _ = require('lodash');

const responseQueue = [];
const authenticationURL = 'http://localhost:3001/authenticate';

const defaultErrorMessage = 'Error: Please check the console.';
const completionSuccessMessage = 'Completing Request Success';
const authFailedMessage =
    'Authentication Failed: Missing or wrong credentials.';
const completionMissingRequestMessage =
    'Request Completion Incomplete: No waiting request found.'
const requestReplacedMessage =
    'Request Replaced: A request with the same requestID has been received.'

// Accept Content-Type: application/json
app.use(express.json());

app.post('/secret', async (req, res) => {
    try {
        if (await authenticateClient(req)) {
            handleWaitingRequest(req.body.requestID, res);
        } else {
            res.send(authFailedMessage);
        }
    } catch (err) {
        console.error(err);
        res.send(defaultErrorMessage)
    }
});

app.post('/complete', async (req, res) => {
    try {
        if (await authenticateClient(req)) {
            handleCompletionRequest(req, res);
        } else {
            res.send(authFailedMessage);
        }
    } catch (err) {
        console.log(err);
        res.send(defaultErrorMessage);
    }
});

/**
 * Authenticate client based on credentials in recieved request
 * @param {request} req | Request recieved
 * @returns {boolean} | Based on authentication success or failure
 */
function authenticateClient(req) {
    return jsonPostAuthRequest(req.body)
        .then((authenticationResponse) => {
            if (authenticationResponse.result) {
                return true;
            } else {
                return false;
            }
        });
}

/**
 * Send a post request with json body to authentication server
 * @param {Object} jsonBody | JSON object containing credentials 
 * @returns {Promise}
 */
function jsonPostAuthRequest(jsonBody) {
    return request.post({
        url: authenticationURL,
        headers: {
            'content-type': 'application/json'
        },
        json: jsonBody
    });
}

/**
 * Handle waiting request overall flow
 * @param {number} waitingRequestID | Request ID 
 * @param {response} res | Response to be send upon completion 
 */
function handleWaitingRequest(waitingRequestID, res) {
    const responseIndexOrNotExists = requestIdExists(waitingRequestID);
    const responseToQueue = {
        requestID: waitingRequestID,
        response: res
    };
    queueResponse(responseIndexOrNotExists, responseToQueue);
}

/**
 * Handle completion request overall flow
 * @param {request} req | Request recieved to complete waiting request 
 * @param {response} res | Completion response to be sent to second client  
 */
function handleCompletionRequest(req, res) {
    let waitingResponse = getMatchingRequest(req.body.requestID);
    if (waitingResponse) {
        waitingResponse.send(req.body.data);
        res.send(completionSuccessMessage);
    } else {
        res.send(completionMissingRequestMessage);
    }
}

/**
 * Store requestID with corresponding request in queue, in case there's
 * an existing request with same requestID, replace it and respond to
 * the client with an informative message
 * @param {number} responseIndex | Index of request in queue having same id,
 * false if it doesn't exist
 * @param {response} responseToQueue | Response to be sent to the first client
 * upon completion
 */
function queueResponse(responseIndex, responseToQueue) {
    if (responseIndex !== false) {
        responseQueue[responseIndex].response.send(requestReplacedMessage);
        responseQueue.splice(responseIndex, 1, responseToQueue);
    } else {
        responseQueue.push(responseToQueue);
    }
}

/**
 * Check if a response with given requestID exists in the queue
 * @param {number} requestID
 * @returns {number} | Index of response with same requestID, false if it
 * doesn't exist
 */
function requestIdExists(requestID) {
    const responseIndex = _.findIndex(responseQueue, { 'requestID': requestID });
    if (responseIndex !== -1) {
        return responseIndex;
    } else {
        return false;
    }
}

/**
 * Search the queue to get the waiting response having given requestID
 * @param {number} incomingRequestID | RequestID of completion request
 * @returns {response} | Response to be sent to waiting client, false if no
 * response with same requestID was found
 */
function getMatchingRequest(incomingRequestID) {
    const waitingResponseIndex = _.findIndex(responseQueue,
        { 'requestID': incomingRequestID });
    if (waitingResponseIndex !== -1) {
        const waitingResponse = responseQueue[waitingResponseIndex].response
        responseQueue.splice(waitingResponseIndex, 1);
        return waitingResponse;
    } else {
        return false;
    }
}

app.listen(port, () => console.log(`REST-API app listening on port ${port}!`));
