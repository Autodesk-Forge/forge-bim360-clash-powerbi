
const express = require('express');
const router = express.Router(); 
const utility = require("../utility")
const analyze = require('../analyze');

const UserSession = require('../services/userSession');  
const mcClashServices = require('../services/mc.clash.services'); 


router.get('/mc/clash/getMatrixData/:mc_container_id/:ms_id/:ms_v_id', async (req, res, next) => {

  try {
    const mc_container_id = req.params['mc_container_id'] 
    const ms_id = req.params['ms_id']
    const ms_v_id = req.params['ms_v_id'] 
    
    const doc_map = analyze.getDocsMap(mc_container_id,ms_id, ms_v_id)
    if(!doc_map){
        res.status(404).end('no clash data')
        return
    }

    //if ignore the objects whose clashes have been  assigned with the clash issue
    const ignoredAssinedClash = true
    const matrixView = analyze.getMatrixData(mc_container_id,ms_id, ms_v_id,doc_map,ignoredAssinedClash) 
    //await utility.saveJsonObj(analyze_output_path, ms_id +  '-' + ms_v_id + '-matrixView.json',matrixView )
    if(!matrixView)
       res.status(500).end('matrixView null')

    res.status(200).json(matrixView) 
 
   } catch(e) {
      // here goes out error handler
      res.status(500).end()
  }   
}); 

router.get('/mc/clash/getRawClashData/:mc_container_id/:ms_id/:ms_v_id', async (req, res, next) => {

  try {  
    const mc_container_id = req.params['mc_container_id']  
    const ms_id = req.params['ms_id']
    const ms_v_id = req.params['ms_v_id']  
    const clashData = analyze.getRawClashData(mc_container_id,ms_id,ms_v_id) 
    if(!clashData)
        res.status(500).end('raw clash data is null')
    else
        res.status(200).json(clashData) 
 
   } catch(e) {
      // here goes out error handler
      res.status(500).end()
  }   
}); 

module.exports =  router 
