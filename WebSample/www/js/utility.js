class Utility { 
  constructor() {  
    
  } 

  successMessage(title) {  
    $.notify(
      {
        icon: 'glyphicon glyphicon-star',
        title: title,
        message:''
      },
      {
        type:'success'
      }
     );
  } 
 
  failMessage(title) {  
    $.notify(
      {
        icon: 'glyphicon glyphicon-alert',
        title: title,
        message:''
      },
      {
        type:'danger'
      }
     );
  }
  
  checkTimeout(st,end){
    return end - st  > 5 * 60 * 1000  // 5 minutes
  }
}
