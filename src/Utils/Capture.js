const Captrue = () => {
  let isScreenCapturingSupported = false;
  if (
    !!navigator.getDisplayMedia ||
    (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
  ) {
    isScreenCapturingSupported = true;
  }
  const hasGetUserMedia = () => {
    return !!(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );
  };

  const ScreenCapture = async (screen_constraints, cb) => {
    if (!!navigator.getDisplayMedia) {
      console.log("navigator.getDisplayMedia");
      await navigator
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((screenStream) => {
          cb(screenStream);
        });
    } else if (!!navigator.mediaDevices.getDisplayMedia) {
      console.log("screen capture: navigator.mediaDevices.getDisplayMedia");
      await navigator.mediaDevices
        .getDisplayMedia({
          // await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        .then((screenStream) => {
          cb(screenStream);
        });
    } else {
      getScreenId(async (error, sourceId, screen_constraints) => {
        await navigator.mediaDevices
          .getUserMedia(screen_constraints)
          .then((screenStream) => {
            cb(screenStream);
          });
      });
    }
  };

  const getScreenId = (error, sourceId, screen_constraints) => {
    navigator.getUserMedia =
      navigator.mozGetUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.getUserMedia ||
      navigator.msgGetUserMedia;

    return navigator.getUserMedia(
      screen_constraints
      /*
                  (stream) => {
                    
                  },
                  (error) => {
                    console.error(error);
                    alert(error);
                  }
                  */
    );
  };

  return {
    isScreenCapturingSupported: isScreenCapturingSupported,
    isGetUserMediaSupported: hasGetUserMedia(),
    screenCapture: ScreenCapture,
  };
};

export default Captrue();
