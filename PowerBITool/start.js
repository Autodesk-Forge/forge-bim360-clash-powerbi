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

const config = require('./config')
const pbi = require('./pbi.api.services')

async function start(){

    const dataset_collection = await pbi.getDatasets()
    if(!dataset_collection) return 
    let filter = dataset_collection.filter((data)=>{
        return data.name == config.pbi.dataset_name
    }) 
    let dataset_id
    //if a Push Data database with desired name exists
    if(filter && filter.length >0 && filter[0].addRowsAPIEnabled){
        //delete previous rows
        dataset_id = filter[0].id
        //we assume the dataset contains a table with the name like config.pbi.table_name
        const deleteRowsRes = await pbi.deleteRows(dataset_id,config.pbi.table_name) 
        if(!deleteRowsRes)
            return

        //or if you want to delete and recreate dataset
        //(warning: if it has important data to you, make a backup!) 
        //await pbi.deleteDataset(filter[0].id)
    }else{
        // create a new dataset
        const create_dataset_res = await pbi.createDataset(config.pbi.dataset_name,config.pbi.table_name)
        if(!create_dataset_res)
            return
        dataset_id = create_dataset_res.id
    }
    //add dummy rows to the table
    const data =  
            [{ 
                cat: "wall", 
                clash: "123",
                clashcount:"1",
                docname:"doc1",
                fam:"wall",
                mid:"1",
                name:"wall",
                type:"wall",
                vid:"12345"
            },
            { 
                cat: "window", 
                clash: "356",
                clashcount:"3",
                docname:"doc1",
                fam:"window",
                mid:"1",
                name:"window",
                type:"window",
                vid:"34897"
            },
            { 
                cat: "room", 
                clash: "456",
                clashcount:"2",
                docname:"doc2",
                fam:"room",
                mid:"1",
                name:"room",
                type:"room",
                vid:"456789"
            },
            { 
                cat: "airduct", 
                clash: "456",
                clashcount:"5",
                docname:"doc2",
                fam:"airduct",
                mid:"1",
                name:"airduct",
                type:"airduct",
                vid:"90845"
            }  ] 
    const addRowsRes = await pbi.pushDataToDataset(dataset_id,config.pbi.table_name,data)
    if(!addRowsRes) return
    console.log('dataset id:' + dataset_id + ' table name:' + config.pbi.table_name)

}

start()
