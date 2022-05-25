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
const fetch = require('node-fetch');
const config = require('./config')

module.exports = {
    getDatasets,
    createDataset,
    pushDataToDataset, 
    deleteRows,
    deleteDataset,
    getTables
}
 
async function getOpenIdToken() {

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const body = {
        client_id: config.pbi.applicationId,
        scope: 'openid Dataset.ReadWrite.All',
        resource: config.pbi.resourceUrl,
        username: config.pbi.pbiUsername,
        password: config.pbi.pbiPassword,
        grant_type: 'password'//,

        //looks screte is not required anymore 
       // client_secret:config.pbi.applicationSecret
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
        console.log('get openId token succeeded' ) 
        return json
     } else {
        const text = await response.text() 
        const statusText = await response.statusText() 
        console.log('get openId token failed' + text!=''?text:statusText )
        return null
     }
} 

//get dataset collection
async function getDatasets(){
    var openIdToken = await getOpenIdToken() 
    const headers = {
         'Authorization':'Bearer '+openIdToken.access_token
    } 
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/groups/'+ config.pbi.workspaceId + '/datasets' 
    const options = { method: 'GET', headers: headers || {} };
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
        const json = await response.json();
        return json.value
    } else {
        const text = await response.text() 
        const statusText = await response.statusText() 
        console.log('get dataset failed' + text!=''?text:statusText )
        return null
    }   
}

async function deleteDataset(dataset_id){
    var openIdToken = await getOpenIdToken()

    const headers = {
         'Authorization':'Bearer '+openIdToken.access_token
    }
    
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/'
                    + 'datasets/'+ dataset_id
 
    const options = { method: 'DELETE', headers: headers || {}};
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
        console.log('delete dataset succeeded' )  
        return true
    } else {
        const text = await response.text() 
        const statusText = await response.statusText() 
        console.log('delete dataset failed' + text!=''?text:statusText )
        return null
    }  
} 
 
//create dataset of Push Data
async function createDataset(dataset_name,table_name) {

    var openIdToken = await getOpenIdToken()

    const headers = {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+openIdToken.access_token
    }

    //define the schema
    const body = {
        name: dataset_name, 
        tables: [
        {
            name: table_name, 
            columns: [
            //object category
            { name: "cat", dataType: "string"}, 
            //clash ids array
            { name: "clash", dataType: "string"},
            //clash counts (length of array above)
            { name: "clashcount", dataType: "Int64"},
            //name of the document which the object resides in 
            { name: "docname", dataType: "string"},
            //family name of the object
            { name: "fam", dataType: "string"}, 
            //document index id (string id)
            { name: "mid", dataType: "string"},
            //object name (same to that on model tree of Forge Viewer)
            { name: "name", dataType: "string"},
            //object type
            { name: "type", dataType: "string"},
            //object id in derivative (same to dbId in Forge Viewer)
            { name: "vid", dataType: "string"}  
            ]
        }
      ]  
    }

    const endpoint = 'https://api.powerbi.com/v1.0/myorg/groups/'+ config.pbi.workspaceId + '/datasets' 
    const options = { method: 'POST', headers: headers || {},body: JSON.stringify(body) };
    const response = await fetch(endpoint, options);
    if (response.status == 201 ) {
        const json = await response.json();
        console.log('create dataset succeeded' )    
        return json
    } else {
        const text = await response.text() 
        const statusText = await response.statusText() 
        console.log('create dataset failed' + text!=''?text:statusText )
        return null
    }  
}   

//push data rows to dataset
//depending on the data array length, might be better to splice the array if large number of rows
async function pushDataToDataset(dataset_id,table_name,data){

    var openIdToken = await getOpenIdToken() 
    const headers = {
        'Content-Type': 'application/json',
        'Authorization':'Bearer '+openIdToken.access_token
    }  
    const body = {
        rows: data
    }
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/datasets/'+ dataset_id + '/tables/'+ table_name+'/rows'
    const options = { method: 'POST', headers: headers || {},body: JSON.stringify(body) };
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) { 
        console.log(' push data to dataset succeeded') 
        return true
    } else {
        const text = await response.text() 
        const statusText = await response.statusText() 
        console.log('push data to dataset failed' + text!=''?text:statusText ) 
        return null
    }   
}


//delete rows from a table
//https://docs.microsoft.com/en-us/rest/api/power-bi/pushdatasets/datasets_deleterows
async function deleteRows(dataset_id,table_name){
    var openIdToken = await getOpenIdToken()

    const headers = {
         'Authorization':'Bearer '+openIdToken.access_token
    }
    
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/'
                    + 'datasets/'+ dataset_id
                     +'/tables/'+table_name +'/rows'

    const options = { method: 'DELETE', headers: headers || {}};
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
        console.log(' delete rows succeeded')  
         return true
    } else {
        const text = await response.text() 
        const statusText = await response.statusText() 
        console.log(' delete rows failed' + text!=''?text:statusText ) 
        return null
    }  
} 


async function getTables(dataset_id){
    var openIdToken = await getOpenIdToken()

    const headers = {
         'Authorization':'Bearer '+openIdToken.access_token
    }
    
    const endpoint = 'https://api.powerbi.com/v1.0/myorg/'
                    + 'datasets/'+ dataset_id
                     +'/tables/'

    const options = { method: 'GET', headers: headers || {}};
    const response = await fetch(endpoint, options);
    if (response.status == 200 ) {
        console.log(' get tables succeeded')  
        const json = await response.json(); 
        return json.value
    } else {
        const text = await response.text() 
        const statusText = await response.statusText() 
        console.log(' get tables  failed' + text!=''?text:statusText ) 
        return null
    }  
} 





