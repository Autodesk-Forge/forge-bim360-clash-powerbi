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
const config = require('../config');

const pbServices = require('../services/pb.api.services');
const analyze = require('../analyze');

router.get('/pb/getPBIToken', async (req, res, next) => {

  try { 
      const embed_token = await pbServices.getPBIToken()
      res.json(embed_token) 
 
   } catch(e) {
      // here goes out error handler
      res.status(500).end()
  }   
});  

router.get('/pb/getEmbedInfo', async (req, res, next) => {

  try {  
      const emedInfo = await pbServices.getReportData(config.pb.reportId)
      res.json({embedUrl:emedInfo.embedUrl,
                embedReportId:config.pb.reportId})  
   } catch(e) {
      // here goes out error handler
      res.status(500).end()
  }   
});

router.get('/pb/refreshPBIDatabase', async (req, res, next) => {

  try {  
      res.json({embedUrl:config.pb.EmbedUrl,embedReportId:config.pb.reportId})  
   } catch(e) {
      // here goes out error handler
      res.statusCode(500).end()
  }   
});

router.post('/pb/updateReportData', async (req, res, next) => {

  try {  

    const mc_container_id = req.body.mc_container_id 
    const ms_id = req.body.ms_id  
    const ms_v_id = req.body.ms_v_id 
    const twoDocuments = req.body.twoDocuments  

    //check if one dataset exists
    const datasetId = config.pb.datasetId
    const tableName = config.pb.tableName
    const datasets = await pbServices.getDatasets()
    if(datasets){
      const filter = datasets.filter(function(data){return data.id == datasetId})
      if(filter && filter.length>0){

        var jobId = utility.randomValueBase64(6)
        utility.storeStatus(jobId,'running') 
        res.status(200).json({jobId:jobId})     

        //notify client and start start to update rows of the dataset
         const deleteRows = await pbServices.deleteRows(datasetId,tableName)
         if(deleteRows){
            //prepare analyzed data of the two models
            const clashesInTwoDocuments = await analyze.clashedObjectsInTwoDocs(twoDocuments,mc_container_id,ms_id,ms_v_id)
            //push data to dataset of PowerBI
            const pushData =  await pbServices.pushDataToDataset(datasetId,tableName,clashesInTwoDocuments) 
            if(pushData)
               //now the client side will refresh embed report of PowerBI 
               utility.storeStatus(jobId, 'succeeded') 
            else
               utility.storeStatus(jobId, 'failed') 
         }else{
             utility.storeStatus(jobId, 'failed') 
             console.log('no such dataset!')
          }

      }else{
        console.log('no such dataset!')
        res.status(500).end() 
       } 
    }else{
      res.status(500).end() 
    } 

   } catch(e) {
      // here goes out error handler
      res.status(500).end()
  }   
});


router.get('/pb/getRefreshReportStatus/:jobId', async (req, res, next) => {

  try {   
    const jobId = req.params['jobId'] 
    const status = utility.readStatus(jobId)
    if(status) 
      res.status(200).json({status:status});  
    else 
      res.status(500).json({status:'failed'});
   } catch(e) {
      res.status(500).end('RefreshReportStatus failed!')
  }  
}) 

module.exports =  router  