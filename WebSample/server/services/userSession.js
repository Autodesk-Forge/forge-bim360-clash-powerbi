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

//manage user 3-legged token  

function UserSession(session) {
  this._session = session; 
}

UserSession.prototype.getUserServerOAuth = function () {
  return this._session.userServerOAuth;
};

UserSession.prototype.setUserServerOAuth = function (o) {
  this._session.userServerOAuth = o;
};

UserSession.prototype.getUserClientOAuth = function () {
  return this._session.userClientOAuth ;
};

UserSession.prototype.setUserClientOAuth= function (o) {
  this._session.userClientOAuth = o;
};

UserSession.prototype.getUserServerCredentials = function () {
  return this._session.userServerCredentials;
};

UserSession.prototype.setUserServerCredentials = function (c) {
  this._session.userServerCredentials = c;
};

UserSession.prototype.getUserClientCredentials = function () {
  return this._session.userClientCredentials ;
};

UserSession.prototype.setUserClientCredentials = function (c) {
  this._session.userClientCredentials = c;
};

UserSession.prototype.isAuthorized = function () {
  // !! converts value into boolean
  return (!!this._session.userServerCredentials);
}; 


module.exports = UserSession;
