import React, { Fragment, useEffect, useState, useRef } from "react"; //useEffect, useState
import Capture from "Utils/Capture";
const { isScreenCapturingSupported, screenCapture } = Capture;

// import { getDesktop } from "./desktopCapture";
// const electron = window.require("electron");
// const desktopCapturer = electron.desktopCapturer;

// import ReactPlayer from "react-player";
// import Player from "video-react";

const Screen = ({ socket }) => {
  const [source, setSource] = useState(false);
  const [count, setCount] = useState(0);
  const videoTag = useRef();
  let pc;
  const start = (isCaller) => {
    // run start(true) to initiate a call

    // send any ice candidates to the other peer
    pc = new RTCPeerConnection(); // iceServer config
    pc.onicecandidate = (evt) => {
      console.log("onicecandidate");
      socket.emit("candidate", JSON.stringify({ candidate: evt.candidate }));
    };

    // once remote stream arrives, show it in the remote video element
    pc.onaddstream = (evt) => {
      console.log("onaddstream");
      videoTag.current.srcObject = evt.stream;
      //videoTag.src = URL.createObjectURL(evt.stream);
    };

    // get the local stream, show it in the local video element and send it
    screenCapture(session, (stream) => {
      // selfView.src = URL.createObjectURL(stream);
      pc.addStream(stream);

      if (isCaller) pc.createOffer(gotDescription);
      else pc.createAnswer(pc.remoteDescription, gotDescription);

      function gotDescription(desc) {
        pc.setLocalDescription(desc);
        // signalingChannel.send(JSON.stringify({ "sdp": desc }));
        socket.emit("sdp", JSON.stringify({ sdp: desc }));
      }
    });
  };

  /*
  const displayConstraints = {
    video: {
      frameRate: 60,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      displaySurface: "browser", // 'application', 'browser', 'monitor', 'window'
      cursor: "motion", // 'always', 'motion', 'never'},
    },
    audio: {
      sampleSize: 8, // 샘플 byte 단위
      echoCancellation: true,
      noiseSuppression: true,
    },
  };
  */
  const screen_constraints = {
    mandatory: {
      chromeMediaSource: "screen",
      minWidth: 1920,
      maxWidth: 1920,
      minHeight: 1080,
      maxHeight: 1080,
      minAspectRatio: 1.77,
      maxFrameRate: 15,
    },
    optional: [],
  };
  const session = {
    audio: false,
    video: screen_constraints,
  };

  const getScreen = () => {
    if (source) stop();
    if (isScreenCapturingSupported) {
      try {
        screenCapture(session, (stream) => {
          console.log("screen stream:", stream);
          if (stream) {
            setSource(stream);
            videoTag.current.srcObject = stream;
          }
        });
      } catch (err) {
        console.log(err);
        alert("화면을 가져올 수 없습니다.");
      }
    }
  };
  const stop = () => {
    // videoTag.current.srcObject = null;
    source.getTracks().forEach((track) => track.stop());
    setSource(false);
  };
  useEffect(() => {
    if (source) {
      // 화면공유 중지 시
      source.getVideoTracks()[0].onended = (e) => {
        //oninactive , onended
        console.log(e);
        stop();
        // alert("화면 공유를 중지하였습니다.");
        console.log("ScreenSharing Stopped");
      };
    }
    if (socket) {
      socket.on("message", (evt) => {
        if (!pc) {
          start(false);
          let signal = JSON.parse(evt.data);
          if (signal.sdp)
            pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          else pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      });
    }
  });

  return (
    <div>
      <Fragment>
        <input
          type="number"
          onChange={(e) => {
            setCount(Math.abs(parseInt(e.target.value)));
          }}
          value={count}
          placeholder="select screen number"
        />
      </Fragment>
      <Fragment>
        <button onClick={getScreen}>getScreen</button>
        {!!source && <button onClick={stop}>stop</button>}
      </Fragment>

      {!!source && (
        <div>
          <video
            title="Screen Share"
            id="video"
            // ref={(video) => {
            //   if (!!source) {
            //     video.srcObject = source;
            //   }
            // }}
            ref={videoTag}
            // src={source}
            autoPlay={true}
            playsInline
            controls
            preload="metadata"
            height={!!source ? "50%" : "0%"}
            width={!!source ? "100%" : "0%"}
            style={{
              scale: 2, //transform: "rotate(20deg)"
              // filter: "blur(0px) invert(0) opacity(1)",  //"blur(4px) invert(1) opacity(0.5)"
            }}
            onClick={(e) => {
              e.preventDefault();
              if (e.target.paused) {
                // e.target.play();
              } else {
                // e.target.pause();
              }
            }}
            onDoubleClick={(e) => {
              if (!e.target.fullscreenElement) {
                console.log("fullscreen");
                e.target.requestFullscreen();
              } else {
                if (e.target.exitFullscreen) {
                  e.target.exitFullscreen();
                }
              }
            }}
          />
        </div>
      )}

      <video id="localVideo" autoplay playsinline></video>
      <video id="remoteVideo" autoplay playsinline></video>
      <div>
        <button id="startButton">Start</button>
        <button id="callButton">Call</button>
        <button id="hangupButton">Hang Up</button>
      </div>
    </div>
  );
};

export default Screen;
