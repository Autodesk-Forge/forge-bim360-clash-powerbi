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


class DMProjects { 
  constructor() {  
    
  } 

  async refreshBIMHubs() { 
 
    const hubs = await this.getBIMHubs()
    if(!hubs) 
      return
  
    $('#projectview').html(
      '<div><h4 align="center" >BIM 360 Projects List ' 
      +'<span id="refreshHubs" class="glyphicon glyphicon-refresh" style="cursor: pointer;float:center" title="Refresh list of files"></span></h4></div><br/>'
      +'<div id="hubs_list"></div><br/><br/>'
      +'<div><h4 align="center" >ModelSets </h4></div><br/>'
      +'<div class="list-group" id="modelsetList" >'
      +'<div id="msSpinner"  style="display:none;margin: auto"></div>'
      +'</div>'
    );  
    var _this = this
    hubs.forEach( (ele)=> {  
          var hubId = ele.id
          var name = ele.name 
          var validhtmlid = hubId.replace('b.','')

           //produce the hubs layout
          $('#hubs_list').append(
            '<div class="row" >'
            + '<h5><span class="glyphicon glyphicon-king" style="margin-right:10px;font-size: 15px;"></span>'+name
            + '</h5><div class="list-group" id="' + validhtmlid +'">'
            + '</div></div>' 
          );  
          //dump projects list
          _this.refreshProjects(hubId)
    });  
  
  } 
  
  async refreshProjects(hubId){  
    var validHtmlHubId = hubId.replace('b.','')

    const projects = await this.getBIMProjects(hubId)
    if(!projects) 
      return
   
    projects.forEach( (ele) =>{
          if (ele.type === 'bim360projects')  
              var name = ele.name 
              var projectId = ele.id; 
              var validhtmlid = projectId.replace('b.','')

              $('#'+validHtmlHubId).append(
                 '<a class="list-group-item list-group-item-action" ' 
                 + 'id="'+ validhtmlid  + '"' 
                 + ' data-toggle="list" role="tab" aria-controls="home">' 
                 + '<span class="glyphicon glyphicon-list-alt" style="margin-right:2px;"></span><span></span> '
                 +name+'</a>'
              );   
     }) 
 }


  async getBIMHubs(){
    return new Promise(( resolve, reject ) => { 
      $.ajax({
        url: '/dm/getBIMHubs',
        type: 'GET' ,
        success: function (res) {  
          if(res!=null && res != '') 
            resolve(res)
          else
            resolve(null)
        }
      })
    })
  }

  async getBIMProjects(hubId){
    return new Promise(( resolve, reject ) => { 
      $.ajax({
        url: '/dm/getBIMProjects/'+hubId,
        type: 'GET' ,
        success: function (res) {  
          if(res!=null && res != '')   
            resolve(res)
          else
            resolve(null)
        }
      })
    })
  }

}
