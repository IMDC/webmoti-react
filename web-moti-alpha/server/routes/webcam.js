
      let video = document.querySelector('#videoElement');
      if(navigator.mediaDevices.getUserMedia){
         navigator.mediaDevices.getUserMedia({video:true})
            .then(function(stream){
               video.srcObject = stream;
            })
            // eslint-disable-next-line no-unused-vars
            . catch (function(error){
               console.log("uh-oh... something went wrong");
            })
         } 
      else{
         console.log("getUserMedia not supported");
      }
