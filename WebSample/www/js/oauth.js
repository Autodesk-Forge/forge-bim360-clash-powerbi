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

class oAuth{ 
  constructor() {  
  }

  async forgeSignIn() {
       $.ajax({
        url: '/oauth/url',
        success: function (rootUrl) {
          location.href = rootUrl
        }
      }); 
  }

  async forgeLogoff() {
       $.ajax({
        url: '/oauth/logoff',
        success: function (oauthUrl) {
          location.href = oauthUrl;
        }
      }) 
  } 

   getForgeToken() {
      var token = '';
      $.ajax({
        url: '/oauth/publictoken',
        success: function (res) {
          token = res;
        },
        async: false // this request must be synchronous for the Forge Viewer
      });
      return token; 
  }

  async getForgeUserProfile() {
    return new Promise((resolve, reject) => {   
         jQuery.ajax({
          url: '/dm/user/profile',
          success: function (profile) {
            resolve(profile);
          }
        })
      })
  }

}
 


