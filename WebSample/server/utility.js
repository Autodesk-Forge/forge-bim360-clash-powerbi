
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

const fs = require("fs");
const fetch = require('node-fetch');
const rimraf = require('rimraf');
const readline = require('readline');
const crypto = require('crypto');
const pako = require('pako')


const statusFolder = './Status/'


module.exports = { 
    clearFolder,
    saveJsonObj,
    downloadResources,
    readLinesFile,
    randomValueBase64,
    storeStatus,
    readStatus,
    deleteStatus,
    compressStream 
}

async function clearFolder(folder){
    return new Promise((resolve, reject) => {
        rimraf(folder+ '/*', function () { 
            console.log('clear output foler done'); 
            resolve();
        }); 
    }); 
}   

async function saveJsonObj(path,filename,obj){

    return new Promise((resolve, reject) => {
        const stringToWrite = JSON.stringify(obj, null, ' ')
        // Trim leading spaces:
        .replace(/^ +/gm, '')
        // Add a space after every key, before the `:`:
        .replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&');

        fs.writeFile(path+filename, 
        stringToWrite, function(err) { 
            if(err) {
                reject(err);
            } 
            resolve(path+filename + ' saved!');
        });  
    }); 
}
 


//download file from S3 
async function downloadResources( 
    url,headers,
    path,filename) { 
  
        const options = { method: 'GET', headers: headers }; 
        const res = await fetch(url,options); 
        const fileStream = fs.createWriteStream(path+filename); 
  
        return new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
                res.body.on("error", (err) => {
                reject(err);
            });
            fileStream.on("finish", function(res) {
            resolve(filename);
            }); 
        }); 
  }  
  


async function readLinesFile(csvFilePath){

    return new Promise((resolve, reject) => {

        var returnJson =[]
        let rl = readline.createInterface({
            input: fs.createReadStream(csvFilePath)
        });
        
        let line_no = 0; 
        // event is emitted after each line
        rl.on('line', function(line) {
            line_no++; 
            returnJson.push(JSON.parse(line.trim()))
        }); 
        // end
        rl.on('close', function(line) {
            console.log('Total lines : ' + line_no);
            resolve(returnJson)
        });
    }); 
}

function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
      .toString('base64')   // convert to base64 format
      .slice(0, len)        // return required number of characters
      .replace(/\+/g, '0')  // replace '+' with '0'
      .replace(/\//g, '0'); // replace '/' with '0'
}

function storeStatus(jobId,status){
    fs.writeFileSync(statusFolder + jobId,status)
}

function readStatus(jobId){ 
   if(fs.existsSync(statusFolder + jobId)) {
      var stats = fs.readFileSync(statusFolder + jobId,"utf8")
      return stats; 
   }
   else 
      return null
}


function deleteStatus(jobId){ 
    if(fs.existsSync(statusFolder + jobId)) { 
        fs.unlinkSync(statusFolder + jobId) 
     }  
 }
 

function compressStream(inputJson){ 
    const inputStr = JSON.stringify(inputJson)
    return pako.deflate(inputStr)
 }

 String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, i) {
      return args[i];
    });
  };
  