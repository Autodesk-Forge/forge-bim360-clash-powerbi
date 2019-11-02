//
// Copyright (c) Autodesk, Inc. All rights reserved
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
//
// Utility Class for loading models in sequence for Forge Viewer
// by Eason Kang - Autodesk Developer Network (ADN)
//
class MultipleModelUtil {
  /**
   * @param {Viewer3D} viewer The Forge Viewer instance
   * @constructor
   */
  constructor( viewer ) {
    this.viewer = viewer;
  }

  /**
   * Process Forge URNs
   * @param {Object[]} data Model data to be loaded, e.g. [ { name: 'house.rvt', urn: 'dXJuOmFkc2sub2JqZWN0c....' } ]
   * @returns {Promise}
   */
  processModels( data ) {
    //process each promise
    //refer to http://jsfiddle.net/jfriend00/h3zaw8u8/
    const promisesInSequence = ( tasks, callback ) => {
      const results = [];
      return tasks.reduce( ( p, item ) => {
        return p.then( () => {
          return callback( item ).then( ( data ) => {
            results.push( data );
            return results;
          });
        });
      }, Promise.resolve());
    };

    //start to process
    return promisesInSequence( data, ( d ) => this.loadDocumentPromised( d ) );
  }

  /**
   * Promised function for loading Forge derivative manifest
   * @param {Object} data Model data to be loaded, e.g. { name: 'house.rvt', urn: 'dXJuOmFkc2sub2JqZWN0c....' }
   * @returns {Promise} Loaded viewer model
   */
  loadDocumentPromised( data ) {
    return new Promise(( resolve, reject ) => {

      const onDocumentLoadSuccess = ( doc ) => {
        console.log( `%cDocument for \`${data.name}\` Load Succeeded!`, 'color: blue' );

        // Load model
        this.loadModelPromised(
          data,
          doc,
          onLoadModelSuccess,
          onLoadModelError
        );
      }

      const onDocumentLoadFailure = ( error ) => {
        console.error( `Document for \`${data.name}\` Load Failure, error: \`${error}\`` );
      }

      const onLoadModelSuccess = ( model ) => {
        console.log( `%cModel for \`${data.name}\` Load Succeeded!`, 'color: blue' );

        //build a map from clashDocId with viewer model  
        let docsMap = global_msSet._docsMap  
        let filter = docsMap.filter(function(data){
          return data.urn == 'urn:' + model.myData.urn
        }) 
        //the document must exist in the docsMap
        //store the model with this clashDocId
        if(filter && filter.length>0)
          {
            global_forgeViewer._clashDocToModel[filter[0].clashDocId] ={}
            global_forgeViewer._clashDocToModel[filter[0].clashDocId].model = model 
            global_forgeViewer._clashDocToModel[filter[0].clashDocId].name = filter[0].name
          
          }

        this.viewer.addEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          onGeometriesLoaded
        );
      }

      const onLoadModelError = ( error ) => {
        const msg = `Model for \`${data.name}\` Load Failure, error: \`${error}\``;
        console.error( msg );

        reject( msg );
      }

      const onGeometriesLoaded = ( event ) => {
        this.viewer.removeEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          onGeometriesLoaded
        );

        const msg = `Geometries for \`${data.name}\` Loaded`;

        console.log( `%c${msg}`, 'color: blue' );
        resolve( { msg, model: event.model } );
      }

      // Main: Load Forge derivative manifest
      Autodesk.Viewing.Document.load(
        data.urn,
        onDocumentLoadSuccess,
        onDocumentLoadFailure
      );
    });
  }

  /**
   * Promised function for loading model from the Forge derivative manifest.
   * By default, it loads the first model only.
   * @param {Document} doc Forge derivative manifest representing the model document
   * @param {Function} onLoadModelSuccess Success callback function that will be called while the model was loaded by the Forge Viewer.
   * @param {Function} onLoadModelError Error callback function that will be called while loading model was failed.
   */
  loadModelPromised( data, doc, onLoadModelSuccess, onLoadModelError ) {
    const rootItem = doc.getRoot();
    const filter = { type: 'geometry', role: '3d' };
    const viewables = rootItem.search( filter );

    if( viewables.length === 0 ) {
      return onLoadModelError( 'Document contains no viewables.' );
    }

    // specific viewable as the loading target
    var initialViewable = (data.viewableId ? 
      rootItem.findByGuid(data.viewableId) : 
      doc.getRoot().getDefaultGeometry());

    //const initialViewable = viewables[0];

    const loadOptions = {
      modelNameOverride: data.name 
    };

    const viewer = this.viewer;

    // If no model was loaded, start the viewer and load model together
    if( !viewer.model && !viewer.started ) {
      return viewer.startWithDocumentNode( doc, initialViewable, loadOptions )
        .then( onLoadModelSuccess )
        .catch( onLoadModelError );
    }

    if( viewer.model ) {
      loadOptions.globalOffset = viewer.model.getData().globalOffset;
      loadOptions.keepCurrentModels = true; 
      loadOptions.applyScaling = viewer.getVisibleModels()[0].getDisplayUnit();
    }

    viewer.loadDocumentNode( doc, initialViewable, loadOptions )
      .then( onLoadModelSuccess )
      .catch( onLoadModelError );
  }
}