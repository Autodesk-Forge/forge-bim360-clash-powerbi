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

class PowerBI {
  constructor() {
    this._activeReport = null
    this._selectedClashes = null
  }

  async loadPBIView(twoDocuments, mc_container_id, ms_id, ms_v_id) {

    try {
      const jobId = await this.updateReportData(twoDocuments, mc_container_id, ms_id, ms_v_id)

      var status = 'running'
      const st = new Date().getTime()
      while (status == 'running'
        && !global_Utility.checkTimeout(st, new Date().getTime()))
        status = await this.getRefreshReportStatus(jobId)

      if (status == 'failed') {
        global_Utility.failMessage('refresh records of the two documents failed!')
        return false
      }
      if (status == 'running') {
        global_Utility.failMessage('refresh records of the two documents timeout!')
        return false
      }
      const pbiToken = await this.getPBIToken()
      const embedInfo = await this.getEmbedInfo()
      this.showReport(pbiToken, embedInfo.embedUrl, embedInfo.embedReportId, twoDocuments)
      return true
    }
    catch(ex){
      console.log('loadPBIView Failed!! ' + ex )  
      global_Utility.failMessage('loadPBIView Failed!!') 
      return false
     }
  }

  async getEmbedInfo() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/pb/getEmbedInfo',
        success: function (data) {
          resolve(data)
        }, error: (error) => {
          reject(error)
        }
      });
    })
  }


  async getPBIToken() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/pb/getPBIToken',
        success: function (data) {
          resolve(data)
        }, error: (error) => {
          reject(error)
        }
      });
    })
  }

  async updateReportData(twoDocuments, mc_container_id, ms_id, ms_v_id) {

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        twoDocuments: twoDocuments,
        mc_container_id: mc_container_id,
        ms_id: ms_id,
        ms_v_id: ms_v_id
      })

      $.ajax({
        url: '/pb/updateReportData',
        type: 'POST',
        contentType: 'application/json',
        data: data,
        success: function (data) {
          resolve(data.jobId)
        },
        error: function (error) {
          reject(error)
        }
      });
    })
  }

  async getRefreshReportStatus(jobId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: '/pb/getRefreshReportStatus/' + jobId,
        type: 'GET',
        success: function (data) {
          resolve(data.status)
        }, error: function (error) {
          reject(error)
        }
      });
    })
  }

  async  parse(rawData) {

    return new Promise((resolve, reject) => {
      const rows = rawData.split('\r\n');
      const result = [];

      rows.forEach((row) => {
        if (row.length > 1) {
          const chunks = row.split(',');
          const values = [];
          chunks.forEach((chunk) => {
            values.push(chunk);
          });
          result.push(values);
        }
      });
      resolve(result)
    })
  }
  async filter(data, identities) {

    return new Promise((resolve, reject) => {
      const headers = data[0];
      const indexarray = []
      identities.forEach((indent) => {
        const oneIndex = headers.findIndex((v) => {
          return v === indent.target.column;
        });
        indexarray.push({ columnIndex: oneIndex, value: indent.equals })
      })

      const clashIndex = headers.findIndex((v) => {
        return v === 'clash';
      });

      var result = []

      data.forEach((row, rowIndex) => {
        if (rowIndex !== 0) {
          var matched = 0;
          indexarray.forEach((eachIndex) => {
            if (row[eachIndex.columnIndex] == eachIndex.value)
              matched++
          })

          if (matched == indexarray.length) {
            const clashes = row[clashIndex]
            const clashIds = clashes.substring(0, clashes.length - 1).split(';').map(Number)
            result = _.union(result, clashIds)
          }
        }
      });
      resolve(result);
    })
  }

  showReport(token, embedUrl, embedReportId, twoModels) {

    var models = window['powerbi-client'].models;
    var permissions = models.Permissions.All;

    var config = {
      type: 'report',
      tokenType: models.TokenType.Embed,
      accessToken: token,
      embedUrl: embedUrl,
      id: embedReportId,
      permissions: permissions,
      settings: {
        filterPaneEnabled: false,
        navContentPaneEnabled: false,
        background: models.BackgroundType.Transparent,
        layoutType: models.LayoutType.Custom,
        customLayout: {
          displayOption: models.DisplayOption.FitToWidth
        }
      }
    };

    // Get a reference to the embedded report HTML element
    var embedContainer = $('#pbiContainer')[0];

    // Embed the report and display it within the div container.

    if (this._activeReport) {
      this._activeReport.off("loaded");
      this._activeReport.off("rendered");
      this._activeReport.off("dataSelected");
      this._activeReport.off("saved");
      // Report.off removes a given event listener if it exists.
      this._activeReport.off("dataSelected");
        this._activeReport = powerbi.embedNew(embedContainer, config);
    }
    else {
      this._activeReport = powerbi.embed(embedContainer, config);
    }

    // Report.on will add an event handler which prints to Log window.
    this._activeReport.on("loaded", function () {
      console.log("Loaded");
      global_Utility.successMessage('PowerBI Loading Succeeded!!')
    });

    // Report.off removes a given event handler if it exists.
    // Report.on will add an event handler which prints to Log window.
    this._activeReport.on("rendered", function () {
      console.log("Rendered");
    });

    this._activeReport.on("error", function (event) {
      console.log(event.detail);
      global_Utility.failMessage('PowerBI Loading Failed!!')
    });

    this._activeReport.on("saved", function (event) {
      console.log(event.detail);
      if (event.detail.saveAs) {
        console.log('In order to interact with the new report, create a new token and load the new report');
      }
    });


    // Report.on will add an event listener.
    var _this = this
    this._activeReport.on("dataSelected", (event) => {
      console.log("Event - dataSelected:");
      var data = event.detail;
      if (data.dataPoints.length == 0)
        return

      //table row is selected
      if (data.visual.type === 'tableEx') {
        const filter = data.dataPoints[0].identity.filter(function (data) { return data.target.column == 'clash' })
        const clashes = filter[0].equals
        const clashIds = clashes.substring(0, clashes.length - 1).split(';')
        global_forgeViewer.isolateClash(twoModels, clashIds)

        //make a record for creating clash issue  
        _this._selectedClashes = clashIds
      } else {

        //bubble chart is selected
        const identities = data.dataPoints[0].identity;
        window.bubbleData = { identities: identities, report: _this._activeReport };

        (async () => {

          const identities = window.bubbleData.identities
          const report = window.bubbleData.report

          const pages = await report.getPages()
          const page = pages[0]
          const visuals = await page.getVisuals()
          const visual = visuals[0]
          const rawData = await visual.exportData(window['powerbi-client'].models.ExportDataType.Summarized);
          const jsondata = await this.parse(rawData.data)
          const clashIds = await this.filter(jsondata, identities)
          global_forgeViewer.isolateClash(twoModels, clashIds)

          //make a record for creating clash issue
          _this._selectedClashes = clashIds

        })();
      }
    });
  }

}







