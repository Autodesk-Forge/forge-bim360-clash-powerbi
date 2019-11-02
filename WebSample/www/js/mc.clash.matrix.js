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


class ClashMatrixView {
     

    constructor() {  
      this._table = null
    }

    async produceClashMatrixView(mc_container_id,ms_id,ms_v_id){

      try{  
        const matrixData = await this.getMatrixData(mc_container_id,ms_id,ms_v_id) 
        const docsMap = await global_msSet.getClashDocsMap(mc_container_id,ms_id,ms_v_id)
        //const ignoredAssinedClash = res.ignoredAssinedClash

        var cols = [{ data: '0',title:"",orderable:false}]
        for(let index in docsMap)
              cols.push({ data: (index+1).toString() ,title:docsMap[index].name,orderable:false}) 
 
        if(this._table) 
          this._table.clear()
        else{
          this._table = $('#tableMatrix').DataTable( {
            columns: cols,searching: false, paging: false, info: false
          } );  
        } 
        var row = {}
        for(let index in docsMap){
          let left_model_index = index 
          let leftClashDocId = docsMap[index].clashDocId
          row['0'] = docsMap[index].name  
          for(let right_model_index in docsMap){
            if(left_model_index ==  right_model_index)
                row[(right_model_index+1).toString()] = '' //this model itself. no clash objects
            else{
              let rightClashDocId = docsMap[right_model_index].clashDocId
              //find map
              var key1 = leftClashDocId+'-'+ rightClashDocId
              var key2 = rightClashDocId+'-'+ leftClashDocId
              if(key1 in matrixData)
                row[(right_model_index+1).toString()] = Object.keys(matrixData[key1]['left']).length
              if(key2 in matrixData)
                row[(right_model_index+1).toString()] = Object.keys(matrixData[key2]['right']).length 
            } 
          } 
          this._table.row.add(row).draw( false ); 
        }  

        global_Utility.successMessage('Matrix View Generation Succeeded!')  
        return true
      }catch(ex){
        global_Utility.failMessage('Matrix View Generation Failed!')   
        return false
      }
    }
 
  getMatrixData(mc_container_id,ms_id,ms_v_id){
      return new Promise(( resolve, reject ) => {
          $.ajax({
              url: '/mc/clash/getMatrixData/'+mc_container_id+'/'+ms_id+'/'+ms_v_id,
              type: 'GET' ,
                success: function (data) {  
                  resolve(data)
                },error: function (error) {  
                  reject(error) 
              } 
          }); 
      }) 
  }   
}
