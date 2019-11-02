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

var global_oAuth = new oAuth()
var global_dmProjects = new DMProjects() 
var global_msSet = new MSSet()
var global_clashMatrixView= new ClashMatrixView()
var global_clashRawView= new ClashRawView()
var global_forgeViewer= new ForgeViewer()
var global_powerBI= new PowerBI() 
var global_Utility = new Utility()


$(document).ready(function () {  

    $('#iconlogin').click(global_oAuth.forgeSignIn);

    var currentToken = global_oAuth.getForgeToken(); 

    if (currentToken === '')
      $('#signInButton').click(global_oAuth.forgeSignIn);

    else {
      global_oAuth.getForgeUserProfile().then((profile)=> {
        $('#signInProfileImage').removeClass();  
        $('#signInProfileImage').html('<img src="' + profile.picture + '"/>')
        $('#signInButtonText').text(profile.name);
        $('#signInButtonText').attr('title', 'Click to Sign Out');
        $('#signInButton').click(global_oAuth.forgeLogoff);
      })
    } 
 
    if (global_oAuth.getForgeToken() != '') {
      global_dmProjects.refreshBIMHubs();  

      //*for test
      //global_clashMatrixView.produceClashMatrixView('f0f4e54f-8e37-4d30-a9e0-805c6dcc71a1','a96d98b1-6181-4b75-9a09-ff60e06789e3','1') 
      //global_clashRawView.getRawData('f0f4e54f-8e37-4d30-a9e0-805c6dcc71a1','a96d98b1-6181-4b75-9a09-ff60e06789e3','1') 
      //*
    } 
    

    $("#refreshHubs").click(function () {
      global_dmProjects.refreshBIMHubs(); 
    });  
    $('#aboutHelp').click(function(evt){
      if(document.getElementsByName('aboutHelpDialog').length>0)
           $('#aboutHelpDialog').modal('show');
      else
        createHelpAndShow('aboutHelp');
     });

    $('#configHelp').click(function(evt){
      if(document.getElementsByName('configHelpDialog').length>0)
           $('#configHelpDialog').modal('show');
      else
        createHelpAndShow('configHelp');
     });

     $('#basicHelp').click(function(evt){
      if(document.getElementsByName('basicHelpDialog').length>0)
           $('#basicHelpDialog').modal('show');
      else
        createHelpAndShow('basicHelp');
     });

     $('#exportHelp').click(function(evt){
      if(document.getElementsByName('exportHelpDialog').length>0)
           $('#exportHelpDialog').modal('show');
      else
        createHelpAndShow('exportHelp');
     });

     $('#dashboardHelp').click(function(evt){
      if(document.getElementsByName('dashboardHelpDialog').length>0)
           $('#dashboardHelpDialog').modal('show');
      else
        createHelpAndShow('dashboardHelp');
     });

     $('#integrationHelp').click(function(evt){
      if(document.getElementsByName('integrationHelpDialog')>0)
           $('#integrationHelpDialog').modal('show');
      else
        createHelpAndShow('integrationHelp');
     }); 

     delegateProjectSelectedEvent()
     delegateModelsetSelectedEvent()
     delegateMatrixViewSelectedEvent()
     delegateIssueViewSelectedEvent() 

});

function createHelpAndShow(helpName){

  $.ajax({
    url: 'helpDiv/'+helpName+'.html',
    success: function(data) {
        var tempDiv = document.createElement('div'); 
        tempDiv.innerHTML = data;
        document.body.appendChild(tempDiv);

        if(helpName == 'configHelp'){
          $.getJSON("/api/forge/clientID", function (res) {
            $("#ClientID").val(res.ForgeClientId);
            $('#'+helpName+'Dialog').modal('show');  
          }); 
          $("#provisionAccountSave").click(function () {
            $('#configHelpDialog').modal('toggle');
          });
        }else
          $('#'+helpName+'Dialog').modal('show');  
    }
  } );
}

//delegate the event of project selecting
function delegateProjectSelectedEvent(){

  $(document).on('click', '#hubs_list .list-group .list-group-item', function(e) {  
    var $this = $(this);

    //switch the selected status of the item
    $('#hubs_list .list-group-item.active').removeClass('active');
    $this.toggleClass('active') 
  
    //get model coordination container id
    var mc_container_id = $this.attr('id');//it is also project id without 'b.'
   
    (async(mc_container_id)=>{ 
      //start to refresh model set collection
      $('#msSpinner').css({ display: "block" });  
      await global_msSet.refreshModelSets(mc_container_id)   
      $('#msSpinner').css({ display: "none" });  
    })(mc_container_id)  
  })  
} 

//when a modelset is selected
function delegateModelsetSelectedEvent(){

  $(document).on('click', '#modelsetList .list-group-item', function(e) {  
    var $this = $(this);

    //switch the selected status of the item
    $('#modelsetList .list-group-item.active').removeClass('active');
    $this.toggleClass('active') 

    //get related ids
    var ms_id = $this.attr('id') 
    var mc_container_id = $('#hubs_list .list-group .list-group-item.active').attr('id')
    var ms_v_id = $this.attr('tipVersion'); 

    (async(mc_container_id,ms_id,ms_v_id)=>{

      global_msSet.mc_container_id = mc_container_id
      global_msSet.ms_id = ms_id
      global_msSet.ms_v_id = ms_v_id

      $('#loader_stats').css({ display: "block" })
      let r = await global_msSet.refreshOneModelset(mc_container_id,ms_id,ms_v_id)
      if(r)
        r = await global_clashMatrixView.produceClashMatrixView(mc_container_id,ms_id,ms_v_id)  
      if(r)
        r=await global_clashRawView.refreshRawData(mc_container_id,ms_id,ms_v_id)
         
      $('#loader_stats').css({ display: "none" })
    })(mc_container_id,ms_id,ms_v_id)
  }) 
}
 

function delegateMatrixViewSelectedEvent(){
   
  $('#tableMatrix').on('click', 'td', function () {
    const left_model_name = $(this).parent().find('td').html().trim()
    const right_model_name = $('#tableMatrix thead tr th').eq($(this).index()).html().trim() 
    const twoDocuments = global_msSet._docsMap.filter(function (data){
      return (data.name == left_model_name || data.name ==right_model_name)
    })
  
    if(twoDocuments && twoDocuments.length == 2 ){
      $('*').css("background-color", "")  
      $(this).css('background-color',  '#eaff50');

      (async(twoDocuments)=>{
        $('#loader_stats').css({ display: "block" });
        let r = await  global_powerBI.loadPBIView(twoDocuments,
                              global_msSet.mc_container_id,
                              global_msSet.ms_id,
                              global_msSet.ms_v_id) 

          if(r){
          global_forgeViewer.launchViewer(twoDocuments)

          const twoDocsClashes = global_clashRawView._clashInsJsonObj.instances.filter(function(data){
            return  data.ldid == twoDocuments[0].clashDocId && data.rdid == twoDocuments[1].clashDocId ||
                    data.rdid == twoDocuments[0].clashDocId && data.ldid == twoDocuments[1].clashDocId
          })

          //total clashes between the two documents
          $('#pbiTitle').empty()
          $('#pbiTitle').append('<h5 style="text-align:center">PowerBI Analyze by Object Category and Clash Count </h5>'
                              +'<h6 style="text-align:center">Total Clash Count: '+twoDocsClashes.length+'</h6>') 

          }
          $('#loader_stats').css({ display: "none" }); 
      })(twoDocuments) 
     
    }  
  }); 
}
 

function delegateIssueViewSelectedEvent(){
  $(document).on('click', '#tableIssueView tr', function(e) {

    if(!global_forgeViewer){
      global_Utility.failMessage('Forge Viewer is not loaded!')
      return
    }

    var $this = $(this);
    $('.table-active').removeClass('table-active');
    $this.toggleClass('table-active') 
  
    var v = $this.find('td')[7].innerText
    var clashIds = v.split(',') 
    global_forgeViewer.isolateClash(null,clashIds)    
  }) 
} 
 
 