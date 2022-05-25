/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

const request = require('request'); 
const fetch = require('node-fetch');

async function get(endpoint, headers) {
    const options = { headers };
    const response = await fetch(endpoint, options);
    if (response.status == 200) {
        const json = await response.json();
        return json
    } else {
        const message = await response.text(); 
        throw new Error(response.status+ ' ' + response.statusText + ' ' + message);
    }
}

async function fileStreamGet(endpoint, headers) {
    const options = { headers };
    const response = await fetch(endpoint, options);
    if (response.status == 200) {
        return response.body
    } else {
        const message = await response.text(); 
        throw new Error(response.status+ ' ' + response.statusText + ' ' + message);
    }
}

async function post(endpoint, headers, body) {
    const options = { method: 'POST', headers: headers || {}, body: body };
    const response = await fetch(endpoint, options);
    if (response.status == 200 || response.status == 201 ) {
        const json = await response.json();
        return json;
    } else if (response.status == 204){

        return true
    }
    else {
        const message = await response.text();
            throw new Error(response.status+ ' ' + response.statusText + ' ' + message);
    }
}

async function put(endpoint, headers, body) {
    const options = { method: 'PUT', headers: headers || {}, body: body };
    const response = await fetch(endpoint, options);
    if (response.status == 200) {
        const json = await response.json();
        return json;
    } else {
        const message = await response.text();
        throw new Error(response.status+ ' ' + response.statusText + ' ' + message);
    }
}

async function patch(endpoint, headers, body) {
    const options = { method: 'PATCH', headers: headers || {}, body: body };
    const response = await fetch(endpoint, options);
    if (response.status == 200) {
        const json = await response.json();
        return json;
    } else {
        const message = await response.text();
        throw new Error(response.status+ ' ' + response.statusText + ' ' + message);
    }
}


async function mydelete(endpoint, headers) {
    
  return new Promise(function (resolve, reject) {

    request.delete({
      url: endpoint,
      headers: headers
       
    },
      function (error, response, body) {

        if (error) {
            resolve(false);  
        } else {
           resolve(true)  
        }
      }); 
  }); 
}



module.exports = {
    get,
    post,
    put,
    patch,
    mydelete,
    fileStreamGet
};