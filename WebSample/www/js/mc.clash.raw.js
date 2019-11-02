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

class ClashRawView {
  
  constructor() {
    this._clashJsonObj = null
    this._clashInsJsonObj = null
    this._testObj = null

  }  
  
  async refreshRawData(mc_container_id,ms_id, ms_v_id){
    try{ 
      await this.getRawData(mc_container_id,ms_id, ms_v_id)
      global_Utility.successMessage('Refresh Clash Raw Data Succeeded!') 
      return true
    }catch(ex){
      console.log('Refresh Clash Raw Data Failed!' + ex)
      global_Utility.failMessage('Refresh Clash Raw Data Failed!')  
      return false  
    }
  }
  
  async getRawData(mc_container_id,ms_id, ms_v_id) {

    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/mc/clash/getRawClashData/' + mc_container_id +'/' + ms_id + '/' + ms_v_id,
        type: 'GET',
        success:  (data) =>{
          const depressedData = new TextDecoder("utf-8").decode(pako.inflate(data))
          const clashData = JSON.parse(depressedData)
          this._clashInsJsonObj = clashData.clashInsJsonObj
          this._clashJsonObj = clashData.clashJsonObj 
          resolve(true)
        }, error:  (error) =>{
          reject(error)
        }
      });
    })
  }
 
}
