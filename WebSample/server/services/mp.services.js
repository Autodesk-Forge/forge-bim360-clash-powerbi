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
const config = require('../config')
const { get, post, fileStreamGet } = require('./fetch_common')
const fs = require("fs");

module.exports = { 

    getIndex,
    postIndex, //index:merge or diff:merge
    postIndexBatchStatus, //index:batchStaus or diff:batchStatus

    getIndexManifest,
    getIndexFields,
    getIndexProperties,

    getQuery,
    postQuery,
    getQueryProperties
}


async function getIndex(project_id, index_id, isDiff=false) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.get_diff_index.format(project_id, index_id) :
            config.model_property_api.get_index.format(project_id, index_id)

        const headers = config.httpHeaders(config.credentials.token_3legged)
        const response = await get(endpoint, headers);

        return response
    } catch (e) {
        console.error(`get index failed: project_id=${project_id},index_id = ${index_id}, ${e}`)
        return null
    }
}

async function postIndex(project_id, payload, isDiff=false) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.post_diff_index.format(project_id) :
            config.model_property_api.post_index.format(project_id)
        const headers = config.httpHeaders(config.credentials.token_3legged)

        const response = await post(endpoint, headers, payload);

        return response
    } catch (e) {
        console.error(`post index failed: project_id=${project_id}, ${e}`)
        return null
    }
}

async function postIndexBatchStatus(project_id, payload, isDiff=false) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.post_diff_batchStatus.format(project_id) :
            config.model_property_api.post_index_batchStatus.format(project_id)
        const headers = config.httpHeaders(config.credentials.token_3legged)

        const response = await post(endpoint, headers, payload);

        return response
    } catch (e) {
        console.error(`post batchStatus failed: project_id=${project_id}, ${e}`)
        return null
    }
}


async function getQuery(project_id, index_id, query_id, isDiff=false) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.get_diff_query.format(project_id, index_id, query_id) :
            config.model_property_api.get_query.format(project_id, index_id, query_id)
        const headers = config.httpHeaders(config.credentials.token_3legged)
        const response = await get(endpoint, headers);

        return response
    } catch (e) {
        console.error(`get index query failed: project_id=${project_id},index_id = ${index_id}, query_id = ${query_id},${e}`)
        return null
    }
}

async function postQuery(project_id, index_id, payload, isDiff=false) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.post_diff_query.format(project_id, index_id) :
            config.model_property_api.post_query.format(project_id, index_id)
        const headers = config.httpHeaders(config.credentials.token_3legged)
        const response = await post(endpoint, headers, payload);

        return response
    } catch (e) {
        console.error(`post index failed: project_id=${project_id}, ${e}`)
        return null
    }
}

async function getIndexManifest(project_id, index_id, isDiff=false) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.get_diff_manifest.format(project_id, index_id) :
            config.model_property_api.get_index_manifest.format(project_id, index_id)
        const headers = config.httpHeaders(config.credentials.token_3legged)
        const response = await get(endpoint, headers);

        console.log(`getting index manifest index_id = ${index_id}`)
        return response

    } catch (e) {
        console.log(`getting index manifest FAILED! index_id = ${index_id}, error=${e}`)
        return null
    }
}

async function getIndexFields(project_id, index_id, isDiff=false, path, filename) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.get_diff_fields.format(project_id, index_id) :
            config.model_property_api.get_index_fields.format(project_id, index_id)
        const headers = config.httpHeaders(config.credentials.token_3legged)
        const response = await fileStreamGet(endpoint, headers);

        const fileStream = fs.createWriteStream(path + filename);
        return new Promise((resolve, reject) => {

            response.pipe(fileStream);
            response.on("error", (err) => {
                reject(err);
            });
            fileStream.on("finish", (res) => {
                console.log(`getting index fields index_id = ${index_id}`)
                resolve(filename);
            });
        });


    } catch (e) {
        console.log(`getting index fields FAILED! index_id = ${index_id}, error=${e}`)
        return null
    }
}

async function getIndexProperties(project_id, index_id, isDiff=false, path, filename) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.get_diff_properties.format(project_id, index_id) :
            config.model_property_api.get_index_properties.format(project_id, index_id)
        const headers = config.httpHeaders(config.credentials.token_3legged)
        const response = await fileStreamGet(endpoint, headers);

        const fileStream = fs.createWriteStream(path + filename);
        return new Promise((resolve, reject) => {

            response.pipe(fileStream);
            response.on("error", (err) => {
                reject(err);
            });
            fileStream.on("finish", (res) => {
                console.log(`getting index properties index_id = ${index_id}`)
                resolve(filename);
            });
        });


    } catch (e) {
        console.log(`getting index properties FAILED! index_id = ${index_id}, error=${e}`)
        return null
    }
}

async function getQueryProperties(project_id, index_id, query_id, isDiff=false, path, filename) {
    try {
        const endpoint = isDiff ?
            config.model_property_api.get_diff_query_properties.format(project_id, index_id, query_id) :
            config.model_property_api.get_index_query_properties.format(project_id, index_id, query_id)
        const headers = config.httpHeaders(config.credentials.token_3legged)
        const response = await fileStreamGet(endpoint, headers);

        const fileStream = fs.createWriteStream(path + filename);
        return new Promise((resolve, reject) => {

            response.pipe(fileStream);
            response.on("error", (err) => {
                reject(err);
            });
            fileStream.on("finish", (res) => {
                console.log(`getting query properties index_id = ${index_id}`)
                resolve(filename);
            });
        });


    } catch (e) {
        console.log(`getting query properties FAILED! index_id = ${index_id}, error=${e}`)
        return null
    }
} 