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

const fs = require("fs")
const mkdir = require('mkdirp')
const utility = require("./utility")


const mcMSServices = require('./services/mc.modelset.services')
const mcClashServices = require('./services/mc.clash.services');
const mcIndexServices = require('./services/mc.index.services'); 

const clashDataFolder = './ClashData/' 

var DataNameEnum = {
  MS_VERSIONS: 'modelset-version.json',
  CLASH_TESTS: 'clash-tests.json',
  SCOPE_INSTANCE: 'scope-version-clash-instance.2.0.0.json.gz',
  SCOPE_CLASH: 'scope-version-clash.2.0.0.json.gz',
  SCOPE_DOCUMENTS: 'scope-version-document.2.0.0.json.gz',
  CLASH_ISSUES: 'clash-issues.json',
  DOCUMENTS_MAP:'documents-map.json',
  INDEX_MANIFEST:'index-manifest.json',
  INDEX_FIELDS:'index-fields.json.gz',
  INDEX_QUERY_RESULTS:'index-query-results.json.gz'
};

if(!fs.existsSync(clashDataFolder))
  mkdir.mkdirp(clashDataFolder,(err)=>{if(!err)console.log('folder ./ClashData/ is created')})
const statusFolder = './Status/'
if(!fs.existsSync(statusFolder))
  mkdir.mkdirp(statusFolder,(err)=>{if(!err)console.log('folder ./Status/ is created')})
  
module.exports = {
  prepareClashData: prepareClashData,
  buildDocsMap: buildDocsMap,
  getMatrixData: getMatrixData,
  getRawClashData: getRawClashData,
  getDocsMap: getDocsMap,
  clashedObjectsInTwoDocs:clashedObjectsInTwoDocs 
}

async function prepareClashData(input, jobId) { 
  try {
    const mc_container_id  = input.mc_container_id
    const ms_id = input.ms_id
    const ms_v_id = input.ms_v_id

    //create a folder to store the clash data for this modelset version
    const thisClashVersionFolder = clashDataFolder + mc_container_id + '/'+ ms_id + '/' + ms_v_id + '/'
    if (!fs.existsSync(thisClashVersionFolder)) {
      fs.mkdirSync(thisClashVersionFolder, { recursive: true });
    }   

    //the data will be produced if it is missing.. 
    await getModelSetVersionData(thisClashVersionFolder,input)
    await getClashData(thisClashVersionFolder,input)
    await getIndexData(thisClashVersionFolder,input) 
    await getClashIssueData(thisClashVersionFolder,input) 
    await buildDocsMap(thisClashVersionFolder)  
 
    utility.storeStatus(jobId, 'succeeded')

  }
  catch (ex) {
    console.log(ex.toString())
    utility.storeStatus(jobId, 'failed')
  }

}


async function getModelSetVersionData(folder,input){ 

  if(fs.existsSync(folder + DataNameEnum.MS_VERSIONS)) { 
    //model version  info is available 
    console.log(DataNameEnum.MS_VERSIONS + ' are available at' + folder) 
  }else{
      //get versions info of one specific model set 
      const msversions = await mcMSServices.getModelSetVersion(input)
      await utility.saveJsonObj(folder, DataNameEnum.MS_VERSIONS, msversions) 
      console.log(DataNameEnum.MS_VERSIONS + ' downloaded at ' + folder ) 
   } 
} 


async function getClashData(folder,input){ 
   
  if(fs.existsSync(folder + DataNameEnum.CLASH_TESTS) &&
     fs.existsSync(folder + DataNameEnum.SCOPE_DOCUMENTS)&&  
     fs.existsSync(folder + DataNameEnum.SCOPE_INSTANCE)&&
     fs.existsSync(folder + DataNameEnum.SCOPE_CLASH)){
     //all clash data are available
     console.log('  all clash data are available at' + folder) 

     return
   }

  const clashTestsRes = await mcClashServices.getClashTests(input) 
  //one model set version with one clash test
  const oneTest = clashTestsRes.tests.filter(function (item) {
    return item.modelSetVersion === parseInt(input.ms_v_id);
  })

  // one clash test data
  if (oneTest && oneTest.length > 0) {
    
    await utility.saveJsonObj(folder, 'clash-tests.json', oneTest) 
    console.log(DataNameEnum.CLASH_TESTS + ' downloaded at ' + folder ) 

    let testid = oneTest[0].id
    input.testid = testid
    let testRes = await mcClashServices.getClashTestResources(input)
    for (let index in testRes.resources) {
      let resurl = testRes.resources[index].url
      let headers = testRes.resources[index].headers
      let filename = testRes.resources[index].type + '.'+ testRes.resources[index].extension
      let downloadRes = await utility.downloadResources(resurl, headers, folder, filename)
      console.log(' Clash data downloaded at ' + folder ) 
    }
  } 
}



async function getIndexData(folder,input){ 
  
  if(fs.existsSync(folder + DataNameEnum.INDEX_MANIFEST) &&
     fs.existsSync(folder + DataNameEnum.INDEX_FIELDS)&&  
     fs.existsSync(folder + DataNameEnum.INDEX_QUERY_RESULTS)){
     //all clash data are available
     console.log('  all index data are available at' + folder) 

     return
   }

    //get index manifest
    const msVIndexManifest = await mcIndexServices.queryModelSetVersionIndexManifest(input)
    await utility.saveJsonObj(folder, DataNameEnum.INDEX_MANIFEST, msVIndexManifest)
    console.log(DataNameEnum.INDEX_MANIFEST + ' downloaded at ' + folder )  
 
    //Index Fields 
    const msVIndexFields = await mcIndexServices.queryModelSetVersionIndexFields(input)
    let resurl = msVIndexFields.url
    let headers = msVIndexFields.headers
    //now it the url is signed url. not a good idea to parse it to get file name 
    //make unique name ourselves 
    //let filename = resurl.split("/").slice(-1)[0];
    let filename =  DataNameEnum.INDEX_FIELDS
    let downloadRes = await utility.downloadResources(resurl, headers, folder, filename)
    console.log(DataNameEnum.INDEX_FIELDS + ' downloaded at ' + folder )  

    //Index result
    const query =
      "select s.file, s.db, s.docs, s.id, s.p153cb174 as name,s.p20d8441e as category, s.p30db51f9 as family, s.p13b6b3a0 as type from s3object s where count(s.docs)>0"
    input.indexQuery = query
    const queryIndexJob = await mcIndexServices.QueryIndex(input)
    let status = 'Running'
    let jobStatus = null
    input.job_id = queryIndexJob.jobId
    while (status == 'Running') {
      jobStatus = await mcIndexServices.getIndexJob(input)
      status = jobStatus.status
    }
    if (status == 'Succeeded') {
      resurl = jobStatus.resources.results.url
      headers = jobStatus.resources.results.headers
      
      //filename = jobStatus.resources.type;
      filename = DataNameEnum.INDEX_QUERY_RESULTS
      let downloadRes = await utility.downloadResources(resurl, headers, folder, filename)
      console.log(DataNameEnum.INDEX_QUERY_RESULTS + ' downloaded at ' + folder )  
    } 
}


async function getClashIssueData(folder,input){ 

  if(fs.existsSync(folder + DataNameEnum.CLASH_ISSUES)){
     //clash issue data are available
     console.log(DataNameEnum.CLASH_ISSUES + ' are available at' + folder) 
     return    
  }  
  //clash issue 
  const clashIssueGroups = await mcClashServices.getMSAssignedClash(input)
  await utility.saveJsonObj(folder, 'clash-issues.json', clashIssueGroups)
  console.log(DataNameEnum.CLASH_ISSUES + ' downloaded at ' + folder ) 

}
  
//build map with document displayname, index string and clash document id 
async function buildDocsMap(folder) {
 
  if(fs.existsSync(folder + DataNameEnum.DOCUMENTS_MAP)){
    //document map  is available
    console.log(DataNameEnum.DOCUMENTS_MAP + ' are available at' + folder) 
    return    
  }  

  const msversionsBuffer = fs.readFileSync(folder + DataNameEnum.MS_VERSIONS)
  const msversionsJson = JSON.parse(msversionsBuffer)

  const successDocs = msversionsJson.documentVersions.filter(function (data) {
    return data.documentStatus === 'Succeeded'
  })   
  const indexManifestBuffer = fs.readFileSync(folder + DataNameEnum.INDEX_MANIFEST)
  const indexManifestJson = JSON.parse(indexManifestBuffer)
 
  const clashDocumentBuffer = fs.readFileSync(folder + DataNameEnum.SCOPE_DOCUMENTS)
  const clashDocumentJson = JSON.parse(clashDocumentBuffer).documents

  let doc_map = []
  let successMap = true

  for (let i in successDocs) {

    let oneItem = {}
     //docNamePair is modelset version detail info
    //it contains display name, version urn and other data
    const docName = successDocs[i].displayName  
    oneItem.name = docName
    oneItem.versionUrn = successDocs[i].versionUrn
    oneItem.viewableGuid = successDocs[i].viewableGuid
    oneItem.viewableId = successDocs[i].viewableId
    oneItem.lineageUrn = successDocs[i].documentLineage.lineageUrn

    const buff = new Buffer.from(successDocs[i].bubbleUrn);
    oneItem.urn = 'urn:' + buff.toString('base64').replace('/', '_').trim('=')
   
    //find index id (in string)
    let filter = indexManifestJson.seedFiles.filter(
      function (seedFile) {
        return (seedFile.documents.find(({ versionUrn }) =>
          versionUrn === successDocs[i].versionUrn) != undefined)
      }
    );
    if (filter && filter.length > 0)
        oneItem.indexString = filter[0].id
    else {
      console.log(docName + ' index string is not found')
      successMap = false
      break
    }    
    
    //map clash doc id (in number) with the document 
    filter = clashDocumentJson.filter(
      function (data) {
        return data.urn === successDocs[i].versionUrn
      }
    );
    if (filter && filter.length > 0)
        oneItem.clashDocId = filter[0].id
    else {
      console.log(docName + ' clash document id is not found')
      successMap = false
      break
    }

    doc_map.push(oneItem)
  }

  if (successMap) {
    await utility.saveJsonObj(folder, DataNameEnum.DOCUMENTS_MAP, doc_map)
    console.log(DataNameEnum.DOCUMENTS_MAP + ' downloaded at ' + folder ) 
    return doc_map
  }
  else
    console.log(DataNameEnum.DOCUMENTS_MAP + ' FAILED at ' + folder )  
    return null
}

 
function getDocsMap(mc_container_id,ms_id, ms_v_id) {
  try {
    const thisClashVersionFolder = clashDataFolder + mc_container_id + '/'+ ms_id + '/' + ms_v_id + '/'
    if (!fs.existsSync(thisClashVersionFolder))
      return null

    const docsMapBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.DOCUMENTS_MAP)
    const docsMapObj = JSON.parse(docsMapBuffer)

    return docsMapObj
  }
  catch (ex) {
    return null
  }
}

function getRawClashData(mc_container_id,ms_id, ms_v_id) { 
  try {
    const thisClashVersionFolder = clashDataFolder + mc_container_id + '/'+ ms_id + '/' + ms_v_id + '/'
    if (!fs.existsSync(thisClashVersionFolder))
      return null

    var clashInstanceBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.SCOPE_INSTANCE)
    var clashInsJsonObj = JSON.parse(clashInstanceBuffer)

    var clashBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.SCOPE_CLASH)
    var clashJsonObj = JSON.parse(clashBuffer)

    var testBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.CLASH_TESTS)
    var testJsonObj = JSON.parse(testBuffer) 

    //send compressed data
    const inputJson = { testJsonObj:testJsonObj,clashInsJsonObj: clashInsJsonObj, clashJsonObj: clashJsonObj }
    const compressedStreaming = utility.compressStream(inputJson)

    return compressedStreaming
  }
  catch (ex) {
    return null
  }
} 


function getMatrixData(mc_container_id, ms_id, ms_v_id, ignoredAssinedClash) {

  try {
    const thisClashVersionFolder = clashDataFolder + mc_container_id + '/'+ ms_id + '/' + ms_v_id + '/'
    if (!fs.existsSync(thisClashVersionFolder))
      return null

    var clashInstanceBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.SCOPE_INSTANCE)
    var clashInsJsonObj = JSON.parse(clashInstanceBuffer).instances

    var clashIssueBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.CLASH_ISSUES)
    var clashIssueJson = JSON.parse(clashIssueBuffer) 

    const docsMapBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.MS_VERSIONS)
    const docsMapObj = JSON.parse(docsMapBuffer)

    var dic = {}

    for (var index in clashInsJsonObj) {

      var filter = clashIssueJson.filter(
        function (data) { return data.clashes.includes(clashInsJsonObj[index].cid) }
      );

      if (ignoredAssinedClash && filter && filter.length > 0) {
        continue
      }
      var eachItem = clashInsJsonObj[index];

      var did_pair = eachItem.ldid + '-' + eachItem.rdid

      if (did_pair in dic) {
        if (eachItem.lvid in dic[did_pair]['left']) {
          dic[did_pair]['left'][eachItem.lvid]++
        }
        else {
          dic[did_pair]['left'][eachItem.lvid] = 1
        }
        if (eachItem.rvid in dic[did_pair]['right']) {
          dic[did_pair]['right'][eachItem.rvid]++
        }
        else {
          dic[did_pair]['right'][eachItem.rvid] = 1
        }
      } else {
        dic[did_pair] = {};
        dic[did_pair]['left'] = {}
        dic[did_pair]['left'][eachItem.lvid] = 1

        dic[did_pair]['right'] = {}
        dic[did_pair]['right'][eachItem.rvid] = 1
      }
    }
 
    return dic
  }
  catch (ex) {
    return null
  }
}
 

async function clashedObjectsInTwoDocs(twoDocuments,mc_container_id,ms_id, ms_v_id) {  

  const thisClashVersionFolder = clashDataFolder + mc_container_id + '/'+ ms_id + '/' + ms_v_id + '/'
  if (!fs.existsSync(thisClashVersionFolder))
    return null

  const clashInstanceBuffer = fs.readFileSync(thisClashVersionFolder 
                                              + DataNameEnum.SCOPE_INSTANCE)
  const clashInstanceJson = JSON.parse(clashInstanceBuffer).instances

  const clashBuffer = fs.readFileSync(thisClashVersionFolder 
                                      + DataNameEnum.SCOPE_CLASH)
  const clashJson = JSON.parse(clashBuffer).clashes

  const indexResultsJson = await utility.readLinesFile(thisClashVersionFolder + DataNameEnum.INDEX_QUERY_RESULTS) 
  
  const modelDocId0 = twoDocuments[0].clashDocId
  const modelDocId1 = twoDocuments[1].clashDocId 

  //check two models data only
  let twoDocsClashData = clashInstanceJson.filter(function(data){
    return data.ldid == modelDocId0 && data.rdid == modelDocId1 || 
           data.rdid == modelDocId0 && data.ldid == modelDocId1 
  })  

  if(!twoDocsClashData || twoDocsClashData.length==0) return null 

  //we do not know which doc is organized as left / right in  the clash instances
  //but clash pairs are de-duplicated
  //i.e. no clash data will have both ldid & rdid , and rdid & ldid. Only one pair.
  //so, check first item of twoDocsClashData to know what documents are ordered

  
  const docname0 = twoDocuments[0].name
  const docname1 = twoDocuments[1].name

  const indexString0 = twoDocuments[0].indexString  
  const indexString1 = twoDocuments[1].indexString  

  let finalRecords =[] 
  let dic = {}  
  

  twoDocsClashData.forEach(function (eachItem) { 
    
    const ldid = eachItem.ldid
    const lvid = eachItem.lvid 
    const rdid = eachItem.rdid
    const rvid = eachItem.rvid 

    //de-duplicated 
    const doc0_doc1 = ldid +'-' +lvid 
    const doc1_doc0 = rdid +'-' +rvid   

    //find data of left object
    if(!(doc0_doc1 in dic)){
      dic[doc0_doc1]=true  
      let thisRecord = buildIndexClashRecord(indexResultsJson,clashInstanceJson,
        { docname:docname0,indexString:indexString0,ldid:ldid,rdid:rdid,lvid:lvid})
      if(thisRecord)
        finalRecords.push(thisRecord) 
    }
    //find data of right object 
    if(!(doc1_doc0 in dic)){
      dic[doc1_doc0]=true

      let thisRecord = buildIndexClashRecord(indexResultsJson,clashInstanceJson,null,
        { docname:docname1,indexString:indexString1,ldid:ldid,rdid:rdid,rvid:rvid})
      if(thisRecord)
        finalRecords.push(thisRecord) 
    }       
  })  
   

  return finalRecords
}

function buildIndexClashRecord(indexResultsJson,clashInstanceJson,doc0,doc1){ 

let indexFilter = null , clashFilter = null
let docname = null
 if(doc0)
 { 
    docname = doc0.docname
    //find left object in index result
    indexFilter = indexResultsJson.filter(function (data) { 
      return data.file == doc0.indexString && data.id == doc0.lvid }) 
    if(!indexFilter || indexFilter.length==0)
        return null 

    //find all related clashes in clash result 
    clashFilter = clashInstanceJson.filter(function (data) { 
      return data.ldid == doc0.ldid && data.lvid == doc0.lvid && data.rdid == doc0.rdid})
 }
 if(doc1)
 { 
  docname = doc1.docname
   //find right object in index result
   indexFilter = indexResultsJson.filter(function (data) { 
     return data.file == doc1.indexString && data.id == doc1.rvid }) 
   if(!indexFilter || indexFilter.length==0)
       return null 
    //find all related clashes in clash result  
    clashFilter = clashInstanceJson.filter(function (data) { 
      return data.rdid == doc1.rdid && data.rvid == doc1.rvid && data.ldid == doc1.ldid})
   } 

let clashIds='',clashcount=0

 //get out clashes
 if (clashFilter && clashFilter.length > 0) {
  for (let x in clashFilter)
    clashIds += clashFilter[x].cid + ';' 
  clashcount = clashFilter.length
} 

let name = indexFilter[0].name
let type = indexFilter[0].type
let fam = indexFilter[0].family
let cat = indexFilter[0].category
let vid = indexFilter[0].id
let mid = indexFilter[0].file // index string id

let thisRecord = {
   name: name,
   docname:docname ,
   clash: clashIds,
   clashcount: clashcount,
   type: type == null || type == '' ? 'null' : type,
   fam: fam == null || fam == '' ? 'null' : fam,
   cat: cat == null || cat == '' ? 'null' : cat,
   vid: vid,
   mid: mid
 } 
return thisRecord 
}