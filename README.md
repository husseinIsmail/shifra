# Shifra

Two Nodejs microservices providing secure communication over http requests.

## Purpose

The main purpose of this repository is demonstrating my skills in Nodejs.

## Installation

Please make sure you have `Nodejs` and `npm` installed on your machine.
Run the following commands in each of the microservices' directory:
1. In the terminal run `npm install`
2. In the terminal run `npm run`

## Sample Run

Using your tool of choice to send an http request, go through the following:

### Requests

- Client 1 JSON Request:
    { 

        "id": 1, 
        "password": "shifra", 
        "requestID": 12345 
    } 

- Client 2 JSON Request:
    { 

        "id": 2, 
        "secret": "arfihs", 
        "requestID": 12345, 
        "data": "Another request in the wall." 
    }

---

### Responses

- Client 1

    - “Another request in the wall.” 

- Client 2
    - Completing Request Success