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

module.exports = { 

  pbi:{
     AuthorityUrl : 'https://login.microsoftonline.com/common',
     resourceUrl : 'https://analysis.windows.net/powerbi/api',
     apiUrl : 'https://api.powerbi.com',
     embedUrlBase : 'https://app.powerbi.com', 
    
     pbiUsername : process.env.POWERBI_USERNAME || '<your PowerBI account name>',
     pbiPassword : process.env.POWERBI_PASSWORD || '<your PowerBI password>', 
     applicationId : process.env.POWERBI_APP_ID || '<your PowerBI application id>',
     workspaceId : process.env.POWERBI_WORKSPACE_ID || '<your PowerBI workspace (group) id>', 
     dataset_name:process.env.POWERBI_DATASET_NAME || '<your PowerBI dataset name>',
     table_name:process.env.POWERBI_TABLE_NAME ||'<your PowerBI table name>'
  } 
};
