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
const fs = require("fs");

//const clashclient = require("../MCAPI/Clash");  
const clashclient = require("@adsk/autodesk-forge-bim360-modelcoordination-clash");  

module.exports = { 
    getClashTests:getClashTests,
    getClashTest:getClashTest,
    getClashTestResources:getClashTestResources,
    downloadResources:downloadResources,
    searchContainerIssueClashGroups:searchContainerIssueClashGroups,
    getMSAssignedClash:getMSAssignedClash,
    createScreenshot:createScreenshot,
    createClashIssue:createClashIssue,
    getJobStatus:getJobStatus
} 
 
async function getClashTests(input) {
  clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

  return new Promise((resolve, reject) => {
      var testsApi = new clashclient.TestsApi()

      testsApi.getModelSetClashTests(input.mc_container_id,input.ms_id)
      .then(res=>{
          resolve(res)
      })
      .catch(ex =>{
          console.log(ex)
          reject(ex)
      })  
  })  
} 

async function getClashTest(input) {
  clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

  return new Promise((resolve, reject) => {
      var testsApi = new clashclient.TestsApi() 
      testsApi.getClashTest(input.mc_container_id,input.testid)
      .then(res=>{
          resolve(res)
      })
      .catch(ex =>{
          console.log(ex)
          reject(ex)
      })  
  })  
} 

async function getClashTestResources(input) {
  clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

  return new Promise((resolve, reject) => {
      var testsApi = new clashclient.TestsApi()

      testsApi.getClashTestResources(input.mc_container_id,input.testid)
      .then(res=>{
          resolve(res)
      })
      .catch(ex =>{
          console.log(ex)
          reject(ex)
      })  
  })  
}  

async function downloadResources(input) {
      clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

      const options = { method: 'GET', headers: input.headers }; 
      const res = await fetch(input.resurl,options); 
      const fileStream = fs.createWriteStream(input.path+input.filename); 

      await new Promise((resolve, reject) => {
          res.body.pipe(fileStream);
           res.body.on("error", (err) => {
              reject(err);
          });
          fileStream.on("finish", function(res) {
              resolve();
          }); 
      }); 
} 
 

async function searchContainerIssueClashGroups(input) {
    clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => {
        var assignedApi = new clashclient.AssignedApi()
  
        assignedApi.searchContainerIssueClashGroups(input.mc_container_id,input.ms_id)
        .then(res=>{
            resolve(res.groups)
        })
        .catch(ex =>{
            console.log(ex)
            reject(ex)
        })  
    })  
}  

async function getMSAssignedClashOnePage(input){

    clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => {
        var assignedApi = new clashclient.AssignedApi()
  
        assignedApi.searchContainerIssueClashGroups(input.mc_container_id,input.ms_id,{continuationToken:input.continuationToken})
        .then(res=>{
            resolve(res)
        })
        .catch(ex =>{
            console.log(ex)
            reject(ex)
        })  
    })  
}

async function getMSAssignedClash(input) {
    
    let all =  []
    let continuationToken = 0
    let morePagesAvailable = true;
  

    while(morePagesAvailable){ 
      input.continuationToken = continuationToken
      const single = await getMSAssignedClashOnePage(input)
      all = all.concat(single.groups);
      continuationToken = single.page.continuationToken
      morePagesAvailable = continuationToken > 0 
    }  
    return all 
} 

async function getTestAssignedClash(input) {
    clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => {
        var assignedApi = new clashclient.AssignedApi()
  
        assignedApi.getClashTestResourcesinput(input.mc_container_id,input.testid)
        .then(res=>{
            resolve(res.groups)
        })
        .catch(ex =>{
            console.log(ex)
            reject(ex)
        })  
    })  
}  

async function createScreenshot(input) {
    clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => { 
        //fetch(input.image64based)
        //    .then(res => {
                 //var fileBody=  res instanceof ReadableStream  

                 var screenshotsApi = new clashclient.ScreenShotsApi()  
                 screenshotsApi.addScreenShot(input.mc_container_id,input.ms_id,{body:input.filebody})
                 .then(res=>{
                     resolve(res.id)
                 })
                 .catch(ex =>{
                     console.log(ex)
                     reject(ex)
                 })  
        //}) 
    })  
}  

async function createClashIssue(input) {
    clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => { 
    
        var assignedApi = new clashclient.AssignedApi()
        assignedApi.addAssignedClashGroupBatch(input.mc_container_id,input.test_id,{newAssignedClashGroup:input.issuedata})
            .then(res=>{
                resolve(res.jobId)
            })
            .catch(ex =>{
                console.log(ex)
                reject(ex)
            })  
    }) 
} 

async function getJobStatus(input) {
    clashclient.ApiClient.instance.authentications["oauth2AuthCode"].accessToken = input.credentials.access_token;

    return new Promise((resolve, reject) => { 
    
        var assignedApi = new clashclient.AssignedApi()
        assignedApi.getClashGroupJob(input.mc_container_id,input.jobId)
            .then(res=>{
                resolve(res.status)
            })
            .catch(ex =>{
                console.log(ex)
                reject(ex)
            })  
    }) 
}  


 


