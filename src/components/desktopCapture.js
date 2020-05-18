const electron = window.require("electron");
const desktopCapturer = electron.desktopCapturer;
// import { desktopCapturer } from "electron";

const getDesktop = (displayConstraints, setSource, tag) => {
  desktopCapturer.getSources({ types: ["screen"] }).then(async (sources) => {
    for (const source of sources) {
      if (source.name === "Electron") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: displayConstraints.audio,
            video: displayConstraints.video,
          });
          return stream;
          //   setSource(stream);
          //   tag.current.srcObject = stream;
          // handleStream(stream);
        } catch (e) {
          handleError(e);
        }
        return;
      }
    }
  });
};
function handleStream(stream) {
  const video = document.querySelector("video");
  video.srcObject = stream;
  video.onloadedmetadata = (e) => video.play();
}

function handleError(e) {
  console.log(e);
}

module.exports = { getDesktop: getDesktop };
