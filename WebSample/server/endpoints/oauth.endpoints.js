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


// web framework
var express = require('express');
var router = express.Router();
var request = require('request');

// forge oAuth package
var forgeSDK = require('forge-apis');

var config = require('../config');
var UserSession = require('../services/userSession'); 

router.get('/oauth/clientid', function (req, res) {
  res.json({
    'ForgeClientId': config.credentials.client_id
  });
});

// this end point will logoff the user by destroying the session
// as of now there is no Forge endpoint to invalidate tokens
router.get('/oauth/logoff', function (req, res) {
  req.session.destroy();
  res.end('/');
}); 

// return the public token of the current user
// the public token should have a limited scope (read-only)
router.get('/oauth/publictoken', function (req, res) {

  var userSession = new UserSession(req.session);
  if (!userSession.isAuthorized()) {
    console.log('no token for client');
    res.end("");  
    return;
  } 
  res.end(userSession.getUserClientCredentials().access_token);
});

// return the forge authenticate url
router.get('/oauth/url', function (req, res) {
  // redirect the user to this page
  var url =
    "https://developer.api.autodesk.com" +
    '/authentication/v1/authorize?response_type=code' +
    '&client_id=' + config.credentials.client_id +
    '&redirect_uri=' + config.callbackURL +
    '&scope=' + config.scopeInternal.join(" ");
  res.end(url);
});

// wait for Autodesk callback (oAuth callback)
router.get('/oauth/callback', function (req, res) {

  var code = req.query.code;
  var userSession = new UserSession(req.session);

  // first get a 3-legged token of the user
  var req = new forgeSDK.AuthClientThreeLegged(
     config.credentials.client_id,
     config.credentials.client_secret, 
     config.callbackURL, config.scopeInternal);

   req.getToken(code)
    .then(function (userServerCredentials) {

      console.log('get user server token succeeded!');
      userSession.setUserServerCredentials(userServerCredentials);
      userSession.setUserServerOAuth(req); 
 
      // then refresh and get a token for viewer
      // that we can send to the client
      var req2 = new forgeSDK.AuthClientThreeLegged(
        config.credentials.client_id, 
        config.credentials.client_secret,
        config.callbackURL, 
        config.scopePublic);

      req2.refreshToken(userServerCredentials)
        .then(function (userClientCredentials) {
          console.log('get user client token succeeded!'); 
          userSession.setUserClientCredentials(userClientCredentials);
          userSession.setUserClientOAuth(req); 

           res.redirect('/');
        })
        .catch(function (error) {
          console.log('get user client token failed!');  
          respondWithError(res, error)
        });
    })
    .catch(function (error) {
      console.log('get user server token failed!');   
      respondWithError(res, error)
    });
});

function respondWithError(res, error) {
  if (error.statusCode) {
    res.status(error.statusCode).end(error.statusMessage);
  } else {
    res.status(500).end(error.message);
  }
} 



module.exports = router;
 