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

class ForgeViewer {

  constructor() {
      this._viewer = null
      this._clashDocToModel = {}
  }

  fetchForgeToken(callback) {
      
      $.ajax({
        url: '/oauth/publictoken',
        success: function (res) {
        callback(res, 3600)
      }
    }); 
  }

  launchViewer( models ) { 

    if (this._viewer!=null) {
      this._viewer.tearDown()
      this._viewer.finish()
      this._viewer = null
      $("#forgeViewer").empty();
      this._clashDocToModel = {}
   } 

    if( !models || models.length <= 0 )
      return console.error( 'Empty model input' );

    const options = {
      env: 'AutodeskProduction',
      getAccessToken: this.fetchForgeToken
     };

    var _this = this
    Autodesk.Viewing.Initializer( options, () => {

      //get the viewer div
      const viewerDiv = document.getElementById( 'forgeViewer' );

      var config3d = {  
        //'extensions': ['BIM360IssueExtension']
        };

      //initialize the viewer object
      _this._viewer = new Autodesk.Viewing.Private.GuiViewer3D( viewerDiv ,config3d)
      _this._viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () =>{});         

      //load model one by one in sequence
      const util = new MultipleModelUtil(_this._viewer);
      util.processModels( models );
    });
  }  

  /**
   * Promised function for loading model from the Forge derivative manifest. 
  */
  isolateClash(twoDocs,clashes){ 

    //if(twoDocs.length> Object.keys(global_forgeViewer._clashDocToModel).length){
    //  alert('not all models are loaded in viewer. try after a moment!')
    //  return
    //} 
    let _viewer = this._viewer
    let viewerModels = _viewer.getVisibleModels()
    for(let i in viewerModels){
      _viewer.clearThemingColors(viewerModels[i]); 
    } 
    _viewer.clearSelection();
    _viewer.impl.visibilityManager.aggregateIsolate([]);
   
    var isolate_pair = []
  
    var nodebBox = new THREE.Box3(); 
    for(let id in clashes){
    
          let filter =global_clashRawView._clashInsJsonObj.instances.filter(function(data){
            return  data.cid == clashes[id]
          })
          if(!filter)
            return
          var Ldid = filter[0].ldid
          var Rdid = filter[0].rdid
          var Lvid = filter[0].lvid
          var Rvid = filter[0].rvid
  
           
          var Lmodel = global_forgeViewer._clashDocToModel[Ldid].model
          var Rmodel = global_forgeViewer._clashDocToModel[Rdid].model
  
          var LFragsList = Lmodel.getFragmentList()
          var RFragsList = Rmodel.getFragmentList() 
          var LIT = Lmodel.getData().instanceTree
          var RIT = Rmodel.getData().instanceTree 
  
          _viewer.setThemingColor(Lvid,new THREE.Vector4(1,0,0,1),Lmodel)
          _viewer.setThemingColor(Rvid,new THREE.Vector4(0,0,1,1),Rmodel)  
          
          if(Ldid in isolate_pair){
            isolate_pair[Ldid].push(Lvid)  
          }else{
            isolate_pair[Ldid] = [] 
            isolate_pair[Ldid].push(Lvid)  
          }
  
          if(Rdid in isolate_pair){
            isolate_pair[Rdid].push(Rvid)  
          }else{
            isolate_pair[Rdid] = [] 
            isolate_pair[Rdid].push(Rvid)   
          } 
  
          var fragbBox = new THREE.Box3();
          LIT.enumNodeFragments(Lvid, (fragId) =>{
          LFragsList.getWorldBounds(fragId, fragbBox);
            nodebBox.union(fragbBox);    
          })
          RIT.enumNodeFragments(Rvid, (fragId) =>{
          RFragsList.getWorldBounds(fragId, fragbBox);
            nodebBox.union(fragbBox);   
          })
    } 
  
    let toIsolate = []
    for(let clashDocId in isolate_pair){ 
      let thismodel =  global_forgeViewer._clashDocToModel[clashDocId].model
      toIsolate.push({model:thismodel,ids:isolate_pair[clashDocId]})
    } 
    _viewer.impl.visibilityManager.aggregateIsolate(toIsolate) 
    _viewer.navigation.fitBounds(true, nodebBox ) 
  
  } 
}
