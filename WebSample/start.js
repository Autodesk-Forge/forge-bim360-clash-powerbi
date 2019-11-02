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

var express = require('express')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var app = express()
var server = require('http').Server(app);  


var multer = require('multer')
var upload = multer()


// this session will be used to save the oAuth token
app.use(cookieParser())
app.set('trust proxy', 1) // trust first proxy - HTTPS on Heroku 
app.use(session({
  secret: 'autodeskforge',
  cookie: {
    httpOnly: true,
    secure: (process.env.NODE_ENV === 'production'),
    maxAge: 1000 * 60 * 60 // 1 hours to expire the session and avoid memory leak
  },
  resave: false,
  saveUninitialized: true
}))

var bodyParser = require('body-parser')
app.use(bodyParser.json())// support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

var options = {
  inflate: true,
  limit: '500kb',
  type: 'application/octet-stream'
};
app.use(bodyParser.raw(options))

app.use(upload.array()); 
app.use(express.static('public'))

// prepare server routing
app.use('/', express.static(__dirname+ '/www') );
 

// prepare our API endpoint routing
var oauth = require('./server/endpoints/oauth.endpoints')
var dm = require('./server/endpoints/dm.endpoints.js')
var mc_modelsets = require('./server/endpoints/mc.modelset.endpoints')
var mc_clash = require('./server/endpoints/mc.clash.endpoints')
var pb_api = require('./server/endpoints/pb.api.endpoints')

app.use('/', oauth)
app.use('/', dm)
app.use('/', mc_modelsets) 
app.use('/', mc_clash)
app.use('/', pb_api)   

app.set('port', process.env.PORT || 3000);
 
server.listen(app.get('port'), function() {
    console.log('Server listening on port ' + server.address().port);
});