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

'use strict';
var request = require('request');
const fetch = require('node-fetch');
var fs = require("fs");


const config = require('../config');

module.exports = {
    getPBIToken: getPBIToken,
    getReportData:getReportData,
    getDatasets:getDatasets,
    deleteRows:deleteRows,
    pushDataToDataset:pushDataToDataset
}

async function getPBIToken() {

    var openIdToken = await getOpenIdToken()

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + openIdToken.access_token
    }
    const body = {
        accessLevel: 'View'
    }
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/groups/'
                        +config.pb.workspaceId +
                        '/reports/'+ config.pb.reportId 
                        +'/GenerateToken'
     
    const options = { method: 'POST', headers: headers || {}, body: JSON.stringify(body) };
    const response = await fetch(endpoint, options);
    if (response.status == 200 || response.status == 201 || response.status == 204) {
        const json = await response.json();
        return json.token
    } else {
        const message = await response.text();
        console.log('get PowerBI embedToken failed' + message)
        return response.status + ' ' + response.statusText + ' ' + message
    }

}

async function getOpenIdToken() {

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const body = {
        client_id: config.pb.applicationId,
        scope: 'openid Dataset.ReadWrite.All',
        resource: config.pb.resourceUrl,
        username: config.pb.pbiUsername,
        password: config.pb.pbiPassword,
        grant_type: 'password'
    }
    var formBody = [];
    for (var property in body) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(body[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    const endpoint = 'https://login.microsoftonline.com/common/oauth2/token'

    const options = { method: 'POST', headers: headers || {}, body: formBody };
    const response = await fetch(endpoint, options);
    if (response.status == 200 || response.status == 201 || response.status == 204) {
        const json = await response.json();
        return json
        //resolve(json);
    } else {
        const message = response.text();
        return message
        //reject(response.status+ ' ' + response.statusText + ' ' + message);
    }
} 

async function getReportData(reportId){

    var openIdToken = await getOpenIdToken() 
    const headers = {
         'Authorization':'Bearer '+openIdToken.access_token
    } 
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/reports/'+ reportId
    const options = { method: 'GET', headers: headers || {} };
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
        const json = await response.json();
        return json
    } else {
        const message = await response.text();
        console.log('get getReportData failed' + message)
        return null
    }   
}

async function getDatasets(){
    var openIdToken = await getOpenIdToken() 
    const headers = {
         'Authorization':'Bearer '+openIdToken.access_token
    } 
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/groups/'+ config.pb.workspaceId + '/datasets' 
    const options = { method: 'GET', headers: headers || {} };
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
        const json = await response.json();
        return json.value
    } else {
        const message = await response.text();
        console.log('get getReportData failed' + message)
        return null
    }   
}

//only works with Push Datasets
//https://docs.microsoft.com/en-us/rest/api/power-bi/pushdatasets/datasets_deleterows
async function deleteRows(datasetId,tableName){
    var openIdToken = await getOpenIdToken()

    const headers = {
         'Authorization':'Bearer '+openIdToken.access_token
    }
    
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/'
                    + 'datasets/'+ datasetId
                     +'/tables/'+tableName +'/rows'

    const options = { method: 'DELETE', headers: headers || {}};
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
         return true
    } else {
        const message = await response.text();
        console.log('deleteRows failed' + message)
        return null
    }  
}

async function pushDataToDataset(datasetId,tableName,data){

    var openIdToken = await getOpenIdToken() 
    const headers = {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+openIdToken.access_token
    }  
    const body = {
        rows: data
    }

    const endpoint = 'https://api.powerbi.com/v1.0/myorg/datasets/'+ datasetId + '/tables/'+ tableName+'/rows'
    const options = { method: 'POST', headers: headers || {},body: JSON.stringify(body) };
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
         
        return true
    } else {
        const message = await response.text();
        console.log(' pushDataToDataset failed' + message)
        return null
    }   
}


//backup
async function createDataset(ms_id,ms_v_id) {

    var openIdToken = await getPBIToken()

    const headers = {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+openIdToken.access_token
    }

    const body = {
        name: "audemo-"+ms_id+'-'+ms_v_id, 
        tables: [
        {
            name: "Analyze", 
            columns: [
                { name: "cat", dataType: "string"}, 
                { name: "clash", dataType: "string"},
                { name: "clashcount", dataType: "Int64"},
                { name: "docname", dataType: "string"},
                { name: "fam", dataType: "string"},
                { name: "id", dataType: "string"},
                { name: "mid", dataType: "string"},
                { name: "name", dataType: "string"},
                { name: "type", dataType: "string"},
                { name: "vid", dataType: "vid"}  
                ]
        }
      ]  
    }

    const endpoint = 'https://api.powerbi.com/v1.0/myorg/groups/'+ config.pb.workspaceId + '/datasets' 
    const options = { method: 'POST', headers: headers || {},body: JSON.stringify(body) };
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
        const json = await response.json();
        return json
    } else {
        const message = await response.text();
        console.log('get getReportData failed' + message)
        return response.status + ' ' + response.statusText + ' ' + message
    }  
} 







