# Shifra
Secure communication between 2 Nodejs servers.

## Installation
Please make sure you have `Nodejs` and `npm` installed.
Run the following commands in the termincal inside each of the servers' directory: `npm install` folowed by `npm run`.

## Sample Run
Using your tool of choice to send an http request send the following:

### Requests:
- Client 1 POST body:
````
    { 
        "id": 1, 
        "password": "shifra", 
        "requestID": 12345 
    }
````

- Client 2 POST body:
````
    { 
        "id": 2, 
        "password": "arfihs", 
        "requestID": 12345, 
        "data": "Another request in the wall." 
    }
````
---

### Responses:

- Client 1
    - “Another request in the wall.” 

- Client 2
    - "Completing Request Success"
