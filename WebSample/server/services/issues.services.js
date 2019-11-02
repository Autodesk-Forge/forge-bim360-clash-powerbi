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

//web services (read) of issue api 

'use strict';    
const fetch = require('node-fetch');
const config = require('../config'); 

module.exports = { 
  getIssueTypes:getIssueTypes,
  getRootCause:getRootCause,
  getOneIssue:getOneIssue 
 }

//get issue types and sub types
async function getIssueTypes(input) { 

    const headers = config.issuev1.httpHeaders(input.credentials.access_token)
    const endpoint = config.issuev1.getIssueType(input.containerId)
    const options = { method: 'GET', headers: headers || {} };
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
        const json = await response.json();
        return json.results
    } else {
        const message = await response.text();
        console.log('get getIssueTypes failed' + message)
        return null
    }   
}

//get root causes list of field issue
async function getRootCause(input) {

  const headers = config.issuev1.httpHeaders(input.credentials.access_token)
  const endpoint = config.issuev1.getRootCause(input.containerId)
  const options = { method: 'GET', headers: headers || {} };
  const response = await fetch(endpoint, options);
  if (response.status == 200 ) {
      const json = await response.json();
      return json.data
  } else {
      const message = await response.text();
      console.log('get getRootCause failed' + message)
      return null
  }   
} 

async function getOneIssue(input) {

  const headers = config.issuev1.httpHeaders(input.credentials.access_token)
  const endpoint = config.issuev1.getOneIssue(input.issueContainerId,input.issueId)
  const options = { method: 'GET', headers: headers || {} };
  const response = await fetch(endpoint, options);
  if (response.status == 200 ) {
      const json = await response.json();
      return json.data
  } else {
      const message = await response.text();
      console.log('get getRootCause failed' + message)
      return null
  }  
}  









 


