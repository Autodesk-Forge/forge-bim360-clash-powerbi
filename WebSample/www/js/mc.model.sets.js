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

class MSSet {
     
    constructor() { 
        this._docsMap = null 
        this.mc_container_id = null
        this.ms_id = null
        this.ms_v_id = null
    }

    async refreshModelSets(mc_container_id){

        try{
            const modelSets = await this.getModelSets(mc_container_id)

            var msList = document.getElementById("modelsetList"); 
            modelSets.forEach(element => {
                var a = document.createElement("a");
                a.href = '#'
                a.id = element.ms_id
                a.classList.add('list-group-item')
                a.classList.add('list-group-item-action')
                a.innerHTML = element.ms_name
                a.setAttribute("tipVersion", element.tipVersion); 

                var tag = document.createElement("span"); 
                tag.classList.add('badge')
                tag.classList.add('badge-primary')
                tag.classList.add('badge-pill')  
                tag.classList.add('pull-right')   
                tag.innerHTML = 'v-' +  element.tipVersion 
    
                a.appendChild(tag) 
                msList.appendChild(a); 
            });  
            global_Utility.successMessage('Refresh ModelSet Collection Succeeded!!')
            return true

        }
        catch(ex){
            console.log('Refresh ModelSet Collection Failed!! ' + ex )  
            global_Utility.failMessage('Refresh ModelSet Collection Failed!!') 
            return false
        } 
    } 
     
    
    async getModelSets(mc_container_id){
        return new Promise(( resolve, reject ) => {
            $.ajax({
                url: '/mc/modelset/getModelSets/'+mc_container_id,
                type: 'GET' ,
                success: function (data) {  
                    resolve(data)
                },error: function (error) {  
                    reject(error) 
                } 
            }); 
        }) 
    }  

    //dump clash data on server
    async prepareClashData(mc_container_id,ms_id,ms_v_id){
        return new Promise(( resolve, reject ) => {
            $.ajax({
                url: '/mc/modelset/prepareClashData/'+mc_container_id + '/' + ms_id+'/'+ms_v_id,
                type: 'GET' ,
                  success: function (data) {  
                    resolve(data.jobId)
                  },error: function (error) {  
                    reject(error) 
                } 
            }); 
        }) 
    } 
    
    //get the status of dummping clash data
    async getPrepareStatus(jobId){
        return new Promise(( resolve, reject ) => {
            $.ajax({
                url: '/mc/modelset/getPrepareStatus/'+jobId,
                type: 'GET' ,
                  success: function (data) {  
                    resolve(data.status)
                  },error: function (error) {  
                    reject(error) 
                } 
            }); 
        }) 
    } 

    async getClashDocsMap(mc_container_id,ms_id,ms_v_id){
        var _this = this
        return new Promise(( resolve, reject ) => {
            $.ajax({
                url: '/mc/modelset/getDocMap/'+ mc_container_id + '/' + ms_id+'/'+ms_v_id,
                type: 'GET' ,
                  success:  (data) => {
                    _this._docsMap = data  
                    resolve(data)
                  },error:  (error) => {  
                    reject(error) 
                } 
            }); 
        }) 
    } 
    
    async refreshOneModelset(mc_container_id,ms_id,ms_v_id){
 
        try{
            const jobId = await this.prepareClashData(mc_container_id,ms_id,ms_v_id) 
            let status = 'running'
        
            //set timeout 
            const st = new Date().getTime()
            while(status == 'running' 
                  && !global_Utility.checkTimeout(st,new Date().getTime()))
                status = await this.getPrepareStatus(jobId) 
            
            if(status == 'failed'){
                global_Utility.failMessage('Prepare ClashData Timeout!') 
                return false
            }  
            if(status == 'failed'){
                global_Utility.failMessage('Prepare ClashData Failed!') 
                return false
            }  

            global_Utility.successMessage('Prepare ClashData Succeeded!')  
            return true
        }
        catch(ex){
            console.log('Prepare ClashData Failed!! ' + ex )  
            global_Utility.failMessage('Prepare ClashData Failed!')  
            return false
        } 
     }
}
  