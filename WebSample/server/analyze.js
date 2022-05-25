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
const model_properties_api = require('./services/mp.services');

const clashDataFolder = './ClashData/'

var DataNameEnum = {

  //these will be with Model Coordination API
  MS_VERSIONS: 'modelset-version.json',
  CLASH_TESTS: 'clash-tests.json',
  SCOPE_INSTANCE: 'scope-version-clash-instance.2.0.0.json.gz',
  SCOPE_CLASH: 'scope-version-clash.2.0.0.json.gz',
  SCOPE_DOCUMENTS: 'scope-version-document.2.0.0.json.gz',
  DOCUMENTS_MAP: 'documents-map.json',

  //these will be with Model Properties API
  INDEX_MANIFEST_DOC0: 'index-manifest-doc0.json',
  INDEX_MANIFEST_DOC1: 'index-manifest-doc1.json',

  INDEX_FIELDS_DOC0: 'index-fields-doc0.json.gz',
  INDEX_FIELDS_DOC1: 'index-fields-doc1.json.gz',

  INDEX_QUERY_RESULTS_DOC0: 'index-query-results-doc0.json.gz',
  INDEX_QUERY_RESULTS_DOC1: 'index-query-results-doc1.json.gz'

};

if (!fs.existsSync(clashDataFolder))
  mkdir.mkdirp(clashDataFolder, (err) => { if (!err) console.log('folder ./ClashData/ is created') })
const statusFolder = './Status/'
if (!fs.existsSync(statusFolder))
  mkdir.mkdirp(statusFolder, (err) => { if (!err) console.log('folder ./Status/ is created') })

module.exports = {
  prepareClashData,
  buildDocsMap,
  getMatrixData,
  getRawClashData,
  getDocsMap,
  clashedObjectsInTwoDocs
}

async function prepareClashData(input, jobId) {
  try {
    const mc_container_id = input.mc_container_id
    const ms_id = input.ms_id
    const ms_v_id = input.ms_v_id

    //create a folder to store the clash data for this modelset version
    const thisClashVersionFolder = clashDataFolder + mc_container_id + '/' + ms_id + '/' + ms_v_id + '/'
    if (!fs.existsSync(thisClashVersionFolder)) {
      fs.mkdirSync(thisClashVersionFolder, { recursive: true });
    }

    //the data will be produced if it is missing.. 
    await getModelSetVersionData(thisClashVersionFolder, input)
    await getClashData(thisClashVersionFolder, input)
    await buildDocsMap(thisClashVersionFolder)

    utility.storeStatus(jobId, 'succeeded')

  }
  catch (ex) {
    console.log(ex.toString())
    utility.storeStatus(jobId, 'failed')
  }

}


async function getModelSetVersionData(folder, input) {

  if (fs.existsSync(folder + DataNameEnum.MS_VERSIONS)) {
    //model version  info is available 
    console.log(DataNameEnum.MS_VERSIONS + ' are available at' + folder)
  } else {
    //get versions info of one specific model set 
    const msversions = await mcMSServices.getModelSetVersion(input)
    await utility.saveJsonObj(folder, DataNameEnum.MS_VERSIONS, msversions)
    console.log(DataNameEnum.MS_VERSIONS + ' downloaded at ' + folder)
  }
}


async function getClashData(folder, input) {

  if (fs.existsSync(folder + DataNameEnum.CLASH_TESTS) &&
    fs.existsSync(folder + DataNameEnum.SCOPE_DOCUMENTS) &&
    fs.existsSync(folder + DataNameEnum.SCOPE_INSTANCE) &&
    fs.existsSync(folder + DataNameEnum.SCOPE_CLASH)) {
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
    console.log(DataNameEnum.CLASH_TESTS + ' downloaded at ' + folder)

    let testid = oneTest[0].id
    input.testid = testid
    let testRes = await mcClashServices.getClashTestResources(input)
    for (let index in testRes.resources) {
      let resurl = testRes.resources[index].url
      let headers = testRes.resources[index].headers
      let filename = testRes.resources[index].type + '.' + testRes.resources[index].extension
      let downloadRes = await utility.downloadResources(resurl, headers, folder, filename)
      console.log(' Clash data downloaded at ' + folder)
    }
  }
}



//get index properties by Model Properties API 
async function getIndexData(folder, project_id, twoDocuments) {


  if (fs.existsSync(folder + DataNameEnum.INDEX_MANIFEST) &&
    fs.existsSync(folder + DataNameEnum.INDEX_FIELDS) &&
    fs.existsSync(folder + DataNameEnum.INDEX_QUERY_RESULTS)) {
    //all clash data are available
    console.log('  all index data are available at' + folder)

    return
  }

  //version urns of two documents
  const version_urn_doc0 = twoDocuments[0].versionUrn
  const version_urn_doc1 = twoDocuments[1].versionUrn
  //post index of the version urns of the pair models
  console.log('  starting indexing....')
  const payload = {
    versions: [
      {
        versionUrn: version_urn_doc0,
        query: {
          "$and": [
            {
              "$gt": [{ "$count": "s.views" }, 0]
            }
          ]
        },
        columns: {
          //Model Coordination (clash) API still uses SVF(1) id
          //use this id to map clash data
          svfId: "s.lmvId", 
          //to work with SVF2 (e.g. in Forge Viewer)
          //use SVF2Id
          svf2Id: "s.svf2Id",
          name: "s.props.p153cb174",
          type: "s.props.p09faf620",
          fam: "s.props.p30db51f9",
          cat: "s.props.p5eddc473"
        }

      },
      {
        versionUrn: version_urn_doc1,
        query: {
          "$and": [
            {
              "$gt": [{ "$count": "s.views" }, 0]
            }
          ]
        },
        columns: {
          //use this id to map clash data
          svfId: "s.lmvId", 
          //to work with SVF2 (e.g. in Forge Viewer)
          //use SVF2Id
          svf2Id: "s.svf2Id",
          name: "s.props.p153cb174",
          type: "s.props.p09faf620",
          fam: "s.props.p30db51f9",
          cat: "s.props.p5eddc473"
        }
      }
    ]

  }
  let result = await model_properties_api.postIndexBatchStatus(project_id, JSON.stringify(payload))
  const index_id_doc0 = result.indexes[0].indexId
  const query_id_doc0 = result.indexes[0].queryId

  const index_id_doc1 = result.indexes[1].indexId
  const query_id_doc1 = result.indexes[1].queryId

  var state_doc0 = result.indexes[0].state
  var state_doc1 = result.indexes[1].state

  while (state_doc0 != 'FINISHED' || state_doc1 != 'FINISHED') {
    console.log('  checking indexing status....')
    //keep polling
    result = await model_properties_api.getIndex(project_id, index_id_doc0)
    state_doc0 = result.state
    result = await model_properties_api.getIndex(project_id, index_id_doc1)
    state_doc1 = result.state
  }
  console.log('  end indexing....')

  //download index manifest
  const index_manifest_doc0 = await model_properties_api.getIndexManifest(project_id, index_id_doc0)
  await utility.saveJsonObj(folder, DataNameEnum.INDEX_MANIFEST_DOC0, index_manifest_doc0)
  console.log(DataNameEnum.INDEX_MANIFEST_DOC0 + ' downloaded at ' + folder)

  const index_manifest_doc1 = await model_properties_api.getIndexManifest(project_id, index_id_doc1)
  await utility.saveJsonObj(folder, DataNameEnum.INDEX_MANIFEST_DOC1, index_manifest_doc1)
  console.log(DataNameEnum.INDEX_MANIFEST_DOC1 + ' downloaded at ' + folder)


  //download index field 
  await model_properties_api.getIndexFields(project_id, index_id_doc0, false, folder, DataNameEnum.INDEX_FIELDS_DOC0)
  console.log(DataNameEnum.INDEX_FIELDS_DOC0 + ' downloaded at ' + folder)

  await model_properties_api.getIndexFields(project_id, index_id_doc1, false, folder, DataNameEnum.INDEX_FIELDS_DOC1)
  console.log(DataNameEnum.INDEX_FIELDS_DOC1 + ' downloaded at ' + folder)

  await model_properties_api.getQueryProperties(project_id, index_id_doc0, query_id_doc0, false, folder, DataNameEnum.INDEX_QUERY_RESULTS_DOC0)
  await model_properties_api.getQueryProperties(project_id, index_id_doc1, query_id_doc1, false, folder, DataNameEnum.INDEX_QUERY_RESULTS_DOC1)

  console.log(DataNameEnum.INDEX_QUERY_RESULTS_DOC0 + ' downloaded at ' + folder)
  console.log(DataNameEnum.INDEX_QUERY_RESULTS_DOC1 + ' downloaded at ' + folder)
}


//build map with document displayname, index string and clash document id 
async function buildDocsMap(folder) {

  if (fs.existsSync(folder + DataNameEnum.DOCUMENTS_MAP)) {
    //document map  is available
    console.log(DataNameEnum.DOCUMENTS_MAP + ' are available at' + folder)
    return
  }

  const msversionsBuffer = fs.readFileSync(folder + DataNameEnum.MS_VERSIONS)
  const msversionsJson = JSON.parse(msversionsBuffer)

  const successDocs = msversionsJson.documentVersions.filter(function (data) {
    return data.documentStatus === 'Succeeded'
  })
 
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

    //map clash doc id (in number) with the document 
    let filter = clashDocumentJson.filter(
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
    console.log(DataNameEnum.DOCUMENTS_MAP + ' downloaded at ' + folder)
    return doc_map
  }
  else
    console.log(DataNameEnum.DOCUMENTS_MAP + ' FAILED at ' + folder)
  return null
}


function getDocsMap(mc_container_id, ms_id, ms_v_id) {
  try {
    const thisClashVersionFolder = clashDataFolder + mc_container_id + '/' + ms_id + '/' + ms_v_id + '/'
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

function getRawClashData(mc_container_id, ms_id, ms_v_id) {
  try {
    const thisClashVersionFolder = clashDataFolder + mc_container_id + '/' + ms_id + '/' + ms_v_id + '/'
    if (!fs.existsSync(thisClashVersionFolder))
      return null

    var clashInstanceBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.SCOPE_INSTANCE)
    var clashInsJsonObj = JSON.parse(clashInstanceBuffer)

    var clashBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.SCOPE_CLASH)
    var clashJsonObj = JSON.parse(clashBuffer)

    var testBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.CLASH_TESTS)
    var testJsonObj = JSON.parse(testBuffer)

    //send compressed data
    const inputJson = { testJsonObj: testJsonObj, clashInsJsonObj: clashInsJsonObj, clashJsonObj: clashJsonObj }
    const compressedStreaming = utility.compressStream(inputJson)

    return compressedStreaming
  }
  catch (ex) {
    return null
  }
}


function getMatrixData(mc_container_id, ms_id, ms_v_id, ignoredAssinedClash) {

  try {
    const thisClashVersionFolder = clashDataFolder + mc_container_id + '/' + ms_id + '/' + ms_v_id + '/'
    if (!fs.existsSync(thisClashVersionFolder))
      return null

    var clashInstanceBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.SCOPE_INSTANCE)
    var clashInsJsonObj = JSON.parse(clashInstanceBuffer).instances 

    const docsMapBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.MS_VERSIONS)
    const docsMapObj = JSON.parse(docsMapBuffer)

    var dic = {}

    for (var index in clashInsJsonObj) { 

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


async function clashedObjectsInTwoDocs(twoDocuments, mc_container_id, ms_id, ms_v_id) {

  const thisClashVersionFolder = clashDataFolder + mc_container_id + '/' + ms_id + '/' + ms_v_id + '/'
  if (!fs.existsSync(thisClashVersionFolder)) {
    fs.mkdirSync(thisClashVersionFolder, { recursive: true });
  }

  //mc_container_id is project_id
  await getIndexData(thisClashVersionFolder, mc_container_id, twoDocuments)

  const clashInstanceBuffer = fs.readFileSync(thisClashVersionFolder + DataNameEnum.SCOPE_INSTANCE)
  const clashInstanceJson = JSON.parse(clashInstanceBuffer).instances 

  const indexResultsJson_doc0 = await utility.readLinesFile(thisClashVersionFolder + DataNameEnum.INDEX_QUERY_RESULTS_DOC0)
  const indexResultsJson_doc1 = await utility.readLinesFile(thisClashVersionFolder + DataNameEnum.INDEX_QUERY_RESULTS_DOC0)

  const modelDocId0 = twoDocuments[0].clashDocId
  const modelDocId1 = twoDocuments[1].clashDocId

  //check two models data only
  let twoDocsClashData = clashInstanceJson.filter(function (data) {
    return data.ldid == modelDocId0 && data.rdid == modelDocId1 ||
      data.rdid == modelDocId0 && data.ldid == modelDocId1
  })

  if (!twoDocsClashData || twoDocsClashData.length == 0) return null
 
  const docname0 = twoDocuments[0].name
  const docname1 = twoDocuments[1].name 

  let finalRecords = []
  let dic = {}


  twoDocsClashData.forEach(function (eachItem) {

    const ldid = eachItem.ldid
    const lvid = eachItem.lvid
    const rdid = eachItem.rdid
    const rvid = eachItem.rvid

    //de-duplicated 
    const doc0_doc1 = ldid + '-' + lvid
    const doc1_doc0 = rdid + '-' + rvid

    //find data of left object
    if (!(doc0_doc1 in dic)) {
      dic[doc0_doc1] = true
      let thisRecord = buildIndexClashRecord(indexResultsJson_doc0, clashInstanceJson,
        { docname: docname0, ldid: ldid, rdid: rdid, lvid: lvid })
      if (thisRecord)
        finalRecords.push(thisRecord)
    }
    //find data of right object 
    if (!(doc1_doc0 in dic)) {
      dic[doc1_doc0] = true

      let thisRecord = buildIndexClashRecord(indexResultsJson_doc1, clashInstanceJson, null,
        { docname: docname1, ldid: ldid, rdid: rdid, rvid: rvid })
      if (thisRecord)
        finalRecords.push(thisRecord)
    }
  })


  return finalRecords
}

function buildIndexClashRecord(indexResultsJson, clashInstanceJson, doc0, doc1) {

  let indexFilter = null, clashFilter = null
  let docname = null
  if (doc0) {
    docname = doc0.docname
    //find left object in index result
    indexFilter = indexResultsJson.filter(function (data) {
      return  data.svfId == doc0.lvid
    })
    if (!indexFilter || indexFilter.length == 0)
      return null

    //find all related clashes in clash result 
    clashFilter = clashInstanceJson.filter(function (data) {
      return data.ldid == doc0.ldid && data.lvid == doc0.lvid && data.rdid == doc0.rdid
    })
  }
  if (doc1) {
    docname = doc1.docname
    //find right object in index result
    indexFilter = indexResultsJson.filter(function (data) {
      return   data.svfId == doc1.rvid
    })
    if (!indexFilter || indexFilter.length == 0)
      return null
    //find all related clashes in clash result  
    clashFilter = clashInstanceJson.filter(function (data) {
      return data.rdid == doc1.rdid && data.rvid == doc1.rvid && data.ldid == doc1.ldid
    })
  }

  let clashIds = '', clashcount = 0

  //get out clashes
  if (clashFilter && clashFilter.length > 0) {
    for (let x in clashFilter)
      clashIds += clashFilter[x].cid + ';'
    clashcount = clashFilter.length
  }

  let name = indexFilter[0].name
  let type = indexFilter[0].type
  let fam = indexFilter[0].fam
  let cat = indexFilter[0].cat
  let vid = indexFilter[0].svf2Id
 
  let thisRecord = {
    name: name,
    docname: docname,
    clash: clashIds,
    clashcount: clashcount,
    type: type == null || type == '' ? 'null' : type,
    fam: fam == null || fam == '' ? 'null' : fam,
    cat: cat == null || cat == '' ? 'null' : cat,
    vid: vid 
   }
  return thisRecord
}