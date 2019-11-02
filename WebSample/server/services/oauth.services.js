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
 
// forge oAuth package
var forgeSDK = require('forge-apis'); 
var config = require('../config');

function getAdminTwoLeggedToken() {

  return new Promise(function(resolve,reject) {

    var forgeOAuth = new forgeSDK.AuthClientTwoLegged(
      config.credentials.client_id,
      config.credentials.client_secret,
      config.scopeInternal);

    forgeOAuth.authenticate()
      .then(function (twoleggedcredentials) {

        console.log('get admin credentials succeeded!');  
 
        resolve({oAuth:forgeOAuth,
                credentials:twoleggedcredentials});
      })
      .catch(function (error) {
        console.log('get admin credentials failed!');  
        reject({error:error});
      });
  });
}

module.exports = {
  getAdminTwoLeggedToken:getAdminTwoLeggedToken
};
 