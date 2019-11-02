# BIM 360 Model Coordination API Sample - PowerBI Anlaysis and Clash Issues 

This repository demonstrates the scenario: analyze clash data by BIM 360 Model Coordination API with [PowerBI](https://powerbi.microsoft.com/en-us/). 

[![node](https://img.shields.io/badge/nodejs-6.11.1-yellow.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-3.10.10-green.svg)](https://www.npmjs.com/)
[![visual code](https://img.shields.io/badge/visual%20code-1.28.2-orange.svg)](https://code.visualstudio.com)

[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](https://forge.autodesk.com/en/docs/oauth/v2/overview/)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v1-green.svg)](https://forge.autodesk.com/en/docs/data/v2/developers_guide/overview/)
[![Viewer](https://img.shields.io/badge/Viewer-v7-green.svg)](https://forge.autodesk.com/en/docs/viewer/v7/developers_guide/overview/)
[![BIM-360](https://img.shields.io/badge/BIM%20360-v1-green.svg)](https://forge.autodesk.com/en/docs/bim360/v1/overview/introduction/) 


[![PowerBI-Client](https://img.shields.io/badge/PowerBI--Client-v2.8.0-orange)](https://github.com/microsoft/PowerBI-JavaScript)
[![PowerBIAPI](https://img.shields.io/badge/PowerBI-v1.0-blue)](https://docs.microsoft.com/en-us/rest/api/power-bi/)

[![ModelSetAPI](https://img.shields.io/badge/ModelSetAPI-3.0.51-lightgrey)]()
[![ClashAPI](https://img.shields.io/badge/ClashAPI-3.3.17-yellowgreen)]()
[![IndexAPI](https://img.shields.io/badge/IndexAPI-1.2.32-orange)]()

[![License](http://img.shields.io/:license-mit-red.svg)](http://opensource.org/licenses/MIT)
[![Level](https://img.shields.io/badge/Level-Intermediate-blue.svg)](http://developer.autodesk.com/)


## Description
This repository demonstrates the scenario: analyze clash data by BIM 360 Model Coordination API with [PowerBI](https://powerbi.microsoft.com/en-us/). 

```diff
-     Note: The logic of this sample works for ModelSet which are created after Oct 1st,2019
```
## Thumbnail

  <p align="center"><img src="./help/main.png" width="1000"></p>   

## Demonstrations

### Demo 1: Matrix View of Clash
1. After the user logs in, select one project in the left panel tree.
2. After modelset list is refreshed, select one modelset. Note: the sample only works with the modelsets which are created after Oct 1st Because Model Coordination API updated and some logic of documents mapping are changed.  
3. When one modelset is selected, the code will firstly dump all relevant data of clash, index of objects, and build the map of documents and clashes. Finally a **Matrix View by Object Count of Active Clash** will be generated. It is same to Grid View of Clash on BIM 360 UI. 

The count in the table indicates how many objects of document (left column) have clash with document (top row). The objects will be excluded if their corresponding clashes have been assigned with a clash issue. Check [API document](https://dev.forge.autodesk.com/en/docs/bim360/v1/tutorials/model-coordination/mc-concept-clash/?sha=6092_51) for more detail on what is matrix view of clash.

  <p align="center"><img src="./help/matrix.png" width="800"></p>   

### Demo 2: PowerBI Anlaysis
1. When **Matrix View by Object Count of Active Clash** is ready, click one cell which has value. 
2. The corresponding pair of documents (LEFT & RIGHT) will be loaded in Forge Viewer
3. In the same time, the corresponding PowerBI report is loaded. It indicates the clashes by objects categories, and clustered by the two documents.
4. Click a category, the corresponding table records will be shown up in table view of PowerBI. The clashes will be highlighted in Forge Viewer. All objects of LEFT document will be in red, while objects of RIGHT document will be in blue. 
5. Click **Export Data** of PowerBI view to dump the filtered records to Excel.
6. Click a single record in the table view, the clahes will be highlighted as well.
 
   <p align="center"><img src="./help/powerbi.png" width="800"></p>  
   <p align="center"><img src="./help/export.png" width="600"></p>  

## Live version
(TO Deploy)
Watch [this video](https://youtu.be/pQaO2Dta97g) on how to play this demo.

## Technology Architecture

1. The sample firstly downloads the model set data, clash data and index data of the selected project. 

 <p align="center"><img src="./help/workflow.png" width="600"></p>  

The relationship of the data are demoed in the figure below:

 <p align="center"><img src="./help/relationship.png" width="800"></p>  

Based on the relationship, the code analyzes the data to build the mapping among clash document, version URN and viewerable guid etc. The mapping is saved to **docsMap.json**

 <p align="center"><img src="./help/docmap.png" width="400"></p>   

2. When a cell of matrix view is selected, the corresponding two documents information will be sent to server. The method **clashedObjectsInTwoDocs** in [analyze.js](./server/analyze.js) will get out all clashes which occur between the two documents, and check the clash objects metadata, finally build records. These records will be pushed to PowerBI data, and refresh PowerBI report accordingly. Check [ReadMe of PowerBI tool](./PowerBITool/PowerBI.md) for more details.


# Setup

## Prerequisites
1. **PowerBI Configuration**: Check [ReadMe of PowerBI tool](./PowerBITool/PowerBI.md). Get _account name_, _account password_, _application id_, _workspace id (group id)_, _dataset id_, _report id_, and input them to [config.js](./server/config.js)
2. **BIM 360 Account**: must be Account Admin to add the app integration. [Learn about provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). 
3. **Forge Account**: Learn how to create a Forge Account, activate subscription and create an app at [this tutorial](http://learnforge.autodesk.io/#/account/). Get _Forge client id_, _Forge client secret_ and _Forge callback url_ and input them to [config.js](./server/config.js)
4. Create some [modelsets of Model Coordination](https://knowledge.autodesk.com/support/bim-360/learn-explore/caas/CloudHelp/cloudhelp/ENU/BIM360D-Model-Coordination/files/GUID-38CC3A1C-92FF-4682-847F-9CFAFCC4CCCE-html.html) in BIM 360. 
5. **Node.js**: basic knowledge with [**Node.js**](https://nodejs.org/en/).
6. **JavaScript** basic knowledge with **jQuery** and **Bootstrap** 

## Running locally
Clone this project or download it. It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone <TODO>

Open the project folder in **Visual Sutdio Code**. Install the required packages, set the enviroment variables with your client ID & secret and finally start it. Via command line, navigate to the folder where this repository was cloned and use the following:

    npm install 
    node start.js

Open the browser: [http://localhost:3000](http://localhost:3000). And follow the thumbnail.gif to play the features.

## Deployment

To deploy this application to Heroku, the **Callback URL** for Forge must use your `.herokuapp.com` address. After clicking on the button below, at the Heroku Create New App page, set your Client ID, Secret and Callback URL for Forge.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/xiaodongliang/bim360-node.js-issues.api)

Watch [this video](https://www.youtube.com/watch?v=Oqa9O20Gj0c) on how deploy samples to Heroku. 
 

# Further Reading
- [BIM 360 API](https://developer.autodesk.com/en/docs/bim360/v1/overview/) and [App Provisioning](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps)
- [Data Management API](https://developer.autodesk.com/en/docs/data/v2/overview/)
- [Viewer](https://developer.autodesk.com/en/docs/viewer/v7)
 

Tutorials:

- [View BIM 360 Models](http://learnforge.autodesk.io/#/tutorials/viewhubmodels)
- [Model Coordination API Document](TODO)
- [Retrieve Issues](https://developer.autodesk.com/en/docs/bim360/v1/tutorials/retrieve-issues)

Blogs:

- [Forge Blog](https://forge.autodesk.com/categories/bim-360-api)
- [Field of View](https://fieldofviewblog.wordpress.com/), a BIM focused blog

### Tips & Tricks

-  Since the clash data might be large, don't pull the file locally and then process it. Decompressing and streaming the results on the fly would also be recommended, as showned in this sample [utility.js](./server/utility.js) 
- To make a simple demo, this sample  does not use database to manage the clash data. 
- On client (browser) side, it may be more efficient to manage the data by IndexDB if the app requires to perform various analysis in different browser sessions.

### Troubleshooting

- **Cannot see my BIM 360 projects**: Make sure to provision the Forge App Client ID within the BIM 360 Account, [learn more here](https://forge.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). This requires the Account Admin permission.

- The code of highlighting objects within Forge Viewer requires the corresponding documents of  clash instances have been loaded. If not, the highlighting will not work, try again when the loading is completed

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by

Xiaodong Liang [@coldwood](https://twitter.com/coldwood), [Forge Partner Development](http://forge.autodesk.com)
