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
 
const indexclient = require("forge-bim360-modelcoordination-index")  
 
module.exports = { 
    queryModelSetVersionIndexManifest:queryModelSetVersionIndexManifest,
    queryModelSetVersionIndexFields:queryModelSetVersionIndexFields,
    QueryIndex:QueryIndex,
    getIndexJob:getIndexJob
}
 
async function queryModelSetVersionIndexManifest(input) {
    indexclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => {
        const indexApi = new indexclient.PropertyIndexApi() 
        indexApi.queryModelSetVersionIndexManifest(input.mc_container_id,input.ms_id,input.ms_v_id)
        .then(res=>{
            resolve(res)
        })
        .catch(ex =>{
            console.log(ex)
            reject(ex)
        })  
    })  
}  


async function queryModelSetVersionIndexFields(input) {
    indexclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => {
        const indexApi = new indexclient.PropertyIndexApi() 
        indexApi.queryModelSetVersionIndexFields(input.mc_container_id,input.ms_id,input.ms_v_id)
        .then(res=>{
            resolve(res)
        })
        .catch(ex =>{
            console.log(ex)
            reject(ex)
        })  
    })  
} 

async function QueryIndex(input) {
    indexclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => {
        const indexApi = new indexclient.PropertyIndexApi()

        indexApi.queryModelSetVersionIndex(input.mc_container_id,input.ms_id,input.ms_v_id,{indexQuery:{statement:input.indexQuery}})
        .then(res=>{
            resolve(res)
        })
        .catch(ex =>{
            console.log(ex)
            reject(ex)
        })  
    })  
} 

async function getIndexJob(input) {
    indexclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => {
        const indexApi = new indexclient.PropertyIndexApi() 
        indexApi.getModelSetJob(input.mc_container_id,input.ms_id,input.job_id)
        .then(res=>{
            resolve(res)
        })
        .catch(ex =>{
            console.log(ex)
            reject(ex)
        })  
    })  
}   
