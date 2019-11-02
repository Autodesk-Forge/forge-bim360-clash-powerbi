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

const express = require('express');
const router = express.Router(); 
 
const UserSession = require('../services/userSession');
const oAuthServices = require('../services/oauth.services'); 
const hubsServices = require('../services/dm.hubs.services');
const projectsServices = require('../services/dm.projects.services');
const issuesServices = require('../services/issues.services');

var bimDatabase = require('../bim.database')

router.get('/dm/getBIMHubs', async (req, res, next) => { 

  try{
    const userSession = new UserSession(req.session);
    if (!userSession.isAuthorized()) {
      res.status(401).end('Please login first');
      return;
    }

    let input = {
      oAuth:userSession.getUserServerOAuth(),
      credentials:userSession.getUserServerCredentials()
    } 
    const hubs = await hubsServices.getHubs(input) 
    if(hubs){
      res.json(hubs)
      getAllHubsInfo(hubs) 
    }
    else
      res.status(500).end() 
  }
  catch(ex){
    console.log('Get BIM hubs failed! ' + ex.toString())
    res.status(500).end()
  } 
})

router.get('/dm/getBIMProjects/:hubId', async (req, res, next) => {
  try{
    const userSession = new UserSession(req.session);
    if (!userSession.isAuthorized()) {
      res.status(401).end('Please login first');
      return;
    } 
    const hubId = req.params['hubId']
    let input = {
      oAuth:userSession.getUserServerOAuth(),
      credentials:userSession.getUserServerCredentials(),
      hubId:hubId
    } 
    const projects = await projectsServices.getProjects(input) 
    if(projects){
      res.json(projects)
      getAllProjectContent(projects,input)
    }
    else
      res.status(500).end() 
  }
  catch(ex){
    console.log('Get BIM projects failed! ' + ex.toString())
    res.status(500).end()
  } 
})

router.get('/dm/user/profile', async (req, res, next) => {
 
  try{
    const userSession = new UserSession(req.session);
    if (!userSession.isAuthorized()) {
      res.status(401).end('Please login first');
      return;
    } 
    let input = {
      oAuth:userSession.getUserServerOAuth(),
      credentials:userSession.getUserServerCredentials()
    } 
    const userprofile = await hubsServices.getUserProfile(input)  
    if(userprofile)
      res.json(userprofile)
    else
      res.status(500).end() 
  }
  catch(ex){
    console.log('Get BIM projects failed! ' + ex.toString())
    res.status(500).end()
  }  
});
 

 async function getAllHubsInfo(hubs) {

  try{
    const twoLO = await oAuthServices.getAdminTwoLeggedToken()  
    for(let index in hubs){ 

        const hubId = hubs[index].id
        var input={
          access_token:twoLO.credentials.access_token, 
          accountId:hubId.substr(2, hubId.length - 1), //remove b. 
          hubId:hubId
        }  
        
        const allUsers = await hubsServices.getHQUsersList(input)
        bimDatabase.refreshHQUsersList(hubId,allUsers); 
        console.log('refreshHQUsersList '+ hubId)  

        const allCompanies = await hubsServices.getHQCompanyList(input)
        bimDatabase.refreshHQCompaniesList(hubId,allCompanies); 
        console.log('refreshHQCompaniesList '+ hubId)  


        console.log('Get BIM hub all info succeeded! '+ hubId)  
      }
  }
  catch(ex){
    console.log(ex)
  } 
}

async function getAllProjectContent(projects,input) {

  try{
    for(let index in projects){ 
        
        var hubId = input.hubId;
        var projectId =projects[index].id;

        bimDatabase.refreshProjectToHub(hubId,projectId)

        input.hubId = hubId
        input.projectId = projectId   
        
        const projectInfo = await projectsServices.getProject(input) 
        console.log('Get on project info! '+ projectId)  
        bimDatabase.refreshIssueContainerIds(projectId,projectInfo.containerId)

        input.containerId = projectInfo.containerId
        const issueTypes = await issuesServices.getIssueTypes(input) 
        console.log('Get on project issueTypes! '+ projectId) 
        bimDatabase.refreshIssueType(projectId,issueTypes)

        const rootCauseTypes = await issuesServices.getRootCause(input) 
        console.log('Get on project rootCauseTypes! '+ projectId) 
        bimDatabase.refreshRootCauses(projectId,rootCauseTypes) 

    } 
  }
  catch(ex){
    console.log(ex)
  } 
 
}  

module.exports =  router 
 

