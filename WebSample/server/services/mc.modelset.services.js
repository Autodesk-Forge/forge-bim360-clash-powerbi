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
 
const msclient = require("forge-bim360-modelcoordination-modelset")  

module.exports = { 
    getModelSets:getModelSets,
    getModelSet:getModelSet,
    getModelSetVersions:getModelSetVersions,
    getModelSetVersion:getModelSetVersion 
}

async function getModelSets(input) {
  msclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;
  return new Promise((resolve, reject) => {
      const modelsetApi = new msclient.ModelSetApi() 
      modelsetApi.getModelSets(input.mc_container_id)
      .then(res=>{
          resolve(res)
      })
      .catch(ex =>{
          console.log(ex) 
          reject(null)
      })  
  })  
} 

async function getModelSet(input) {
  msclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;
  return new Promise((resolve, reject) => {
    const modelsetApi = new msclient.ModelSetApi() 
    modelsetApi.getModelSet(input.mc_container_id,input.ms_id)
      .then(res=>{
          resolve(res)
      })
      .catch(ex =>{
          console.log(ex) 
          reject(ex)
      })  
  })  
} 

async function getModelSetVersions(input) {
  msclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;
  return new Promise((resolve, reject) => {
      const msVersionApi = new msclient.ModelSetVersionsApi() 
      msVersionApi.getModelSetVersions(input.mc_container_id,input.ms_id)
      .then(res=>{
          resolve(res)
      })
      .catch(ex =>{
          console.log(ex)
          reject(ex)
      })  
  })  
} 
async function getModelSetVersion(input) {
    msclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;
    return new Promise((resolve, reject) => {
        const msVersionApi = new msclient.ModelSetVersionsApi() 
        msVersionApi.getModelSetVersion(input.mc_container_id,input.ms_id,input.ms_v_id)
        .then(res=>{
            resolve(res)
         })
        .catch(ex =>{
            console.log(ex)
            reject(ex)
        })  
    })  
  }  