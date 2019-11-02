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
const utility = require("../utility")
const analyze = require('../analyze');

const UserSession = require('../services/userSession');  
const mcMSServices = require('../services/mc.modelset.services'); 

router.get('/mc/modelset/getModelSets/:mc_container_id', async (req, res, next) => {
 
  try {
      let userSession = new UserSession(req.session); 
      if (!userSession.isAuthorized()) {
        console.log('getModelSets: authorization failed!')
        res.status(401).end('Please login first');
        return;
      }   
      const mc_container_id = req.params['mc_container_id']

      let input = {
        oAuth:userSession.getUserServerOAuth(),
        credentials:userSession.getUserServerCredentials(),
        mc_container_id:mc_container_id
      }  

      let mssRaw = await mcMSServices.getModelSets(input)  
      console.log('getModelSets: get model sets raw data.')

      let msArray = []   
      for(let i in  mssRaw.modelSets) {
        let element = mssRaw.modelSets[i]
        input.ms_id = element.modelSetId
        let r = await mcMSServices.getModelSet(input)
        if(!r.isDisabled){
          msArray.push({ms_id:element.modelSetId,
                        ms_name:element.name,
                        tipVersion:r.tipVersion})
         }   
      }
      console.log('getModelSets: get each modelset detail.')

      res.json(msArray)   
 
     } catch(e) {
        // here goes out error handler
        console.error('getModelSets failed: ' + e.toString())
        res.status(500).end()
    } 
}); 
 
router.get('/mc/modelset/getModelSet/:mc_container_id/:ms_id', async (req, res, next) => {
 
  try {
      let userSession = new UserSession(req.session); 
      if (!userSession.isAuthorized()) {
        res.status(401).end('Please login first');
        return;
      }  
      const mc_container_id = req.params['mc_container_id']
      const ms_id = req.params['ms_id']


      let input = {
        oAuth:userSession.getUserServerOAuth(),
        credentials:userSession.getUserServerCredentials(),
        mc_container_id:mc_container_id, 
        ms_id:ms_id
      }  

      let msRes = await mcMSServices.getModelSet(input) 
      res.json(msRes) 
 
     } catch(e) {
        // here goes out error handler
        res.status(500).end()
    } 

}); 

router.get('/mc/modelset/getModelSetVersion/:mc_container_id/:ms_id/:ms_v_id', async (req, res, next) => {

  try {
    let userSession = new UserSession(req.session); 
    if (!userSession.isAuthorized()) {
      res.status(401).end('Please login first');
      return;
    }  
    const mc_container_id = req.params['mc_container_id']
    const ms_id = req.params['ms_id']
    const ms_v_id = req.params['ms_v_id']  

    let input = {
      oAuth:userSession.getUserServerOAuth(),
      credentials:userSession.getUserServerCredentials(),
      mc_container_id:mc_container_id, 
      ms_id:ms_id,
      ms_v_id:ms_v_id
    }  

    let msVsRes = await mcMSServices.getModelSetVersion(input)  
    res.json(msVsRes) 

   } catch(e) {
      // here goes out error handler
      res.status(500).end()
  }  
 
}); 
 

router.get('/mc/modelset/prepareClashData/:mc_container_id/:ms_id/:ms_v_id', async (req, res, next) => {

  try {
    const userSession = new UserSession(req.session)
    if (!userSession.isAuthorized()) {
      console.log('no valid authorization!')
      res.status(401).end('Please login first')
      return
    }   

    var jobId = utility.randomValueBase64(6)
    utility.storeStatus(jobId,'running') 
    res.status(200).json({jobId:jobId})  

    var mc_container_id = req.params['mc_container_id'] 
    var ms_id = req.params['ms_id']
    var ms_v_id = req.params['ms_v_id']   

    let input = {
      oAuth:userSession.getUserServerOAuth(),
      credentials:userSession.getUserServerCredentials(),
      mc_container_id:mc_container_id,
      ms_id:ms_id,
      ms_v_id:ms_v_id
    }   
    analyze.prepareClashData(input,jobId) 

   } catch(e) {
      res.status(500).end('prepareClashData failed!')
  }  
}) 


router.get('/mc/modelset/getPrepareStatus/:jobId', async (req, res, next) => {

  try {   
    const jobId = req.params['jobId'] 
    const status = utility.readStatus(jobId) 

    if(status == 'succeeded')
      // now delete this status file
      utility.deleteStatus(jobId)

    if(status) 
      res.status(200).json({status:status});  
    else 
      res.status(500).json({status:'failed'});
   } catch(e) {
      console.log('getPrepareStatus failed: '+ e.message)  
      res.status(500).end('getPrepareStatus failed!')
  }  
}) 

router.get('/mc/modelset/getDocMap/:mc_container_id/:ms_id/:ms_v_id', async (req, res, next) => {

  try {   
    var mc_container_id = req.params['mc_container_id'] 
     var ms_id = req.params['ms_id']
    var ms_v_id = req.params['ms_v_id']   

    const doc_map = analyze.getDocsMap(mc_container_id,ms_id, ms_v_id)
    if(!doc_map)
        res.status(500).end('doc map is null') 
    else
       res.status(200).json(doc_map) 
   } catch(e) {
      res.status(500).end('getDocMap failed!')
  }  
}) 


module.exports =  router 
 

