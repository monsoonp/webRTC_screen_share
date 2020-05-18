import React, { Fragment, useEffect, useState, useRef } from "react"; //useEffect, useState
import P2P from "socket.io-p2p";
import io from "socket.io-client";

// import { getDesktop } from "./desktopCapture";
// const electron = window.require("electron");
// const desktopCapturer = electron.desktopCapturer;

// import ReactPlayer from "react-player";
// import Player from "video-react";

const Screen = () => {
  const [source, setSource] = useState(false);
  const [count, setCount] = useState(0);
  const [sock, setSock] = useState(false);
  const videoTag = useRef();

  const socketConnect = () => {
    const socket = io("//127.0.0.1:5000");
    setSock(socket);
    if (socket) {
      console.log("socket connection:", socket);
      socket.on("stream", (data) => {
        setSource(data);
        videoTag.current.srcObject = data;
      });
    }
    // const p2p = new P2P(socket);
    // var p2psocket = new P2P(socket, opts)
    /*
    const opts = { numClients: 10 }; // connect up to 10 clients at a time
    const p2p = new P2P(socket, opts, () => {
      console.log("We all speak WebRTC now");
    });
    if (p2p) {
      p2p.on("peer-msg", function (data) {
        console.log("From a peer %s", data);
      });
      p2p.on("go-private", function () {
        p2p.upgrade(); // upgrade to peerConnection
      });
      p2p.on("stream", (data) => {
        setSource(data);
        videoTag.current.srcObject = data;
      });
      
    }
    */
  };

  const getScreenStream = async (callback) => {
    if (!!navigator.getDisplayMedia) {
      console.log("navigator.getDisplayMedia");
      await navigator
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((screenStream) => {
          callback(screenStream);
        });
    } else if (!!navigator.mediaDevices.getDisplayMedia) {
      console.log("navigator.mediaDevices.getDisplayMedia");
      await navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((screenStream) => {
          callback(screenStream);
        });
    } else {
      getScreenId(async (error, sourceId, screen_constraints) => {
        await navigator.mediaDevices
          .getUserMedia(screen_constraints)
          .then((screenStream) => {
            callback(screenStream);
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

    navigator.getUserMedia(
      screen_constraints,
      (stream) => {
        // document.querySelector("video").src = URL.createObjectURL(stream);
        setSource(stream);
        videoTag.current.srcObject = stream;
      },
      (error) => {
        console.error(error);
        alert(error);
      }
    );
  };

  const hasGetUserMedia = () => {
    return !!(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );
  };
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
  const getDisplay = async (cb) => {
    const stream = await navigator.mediaDevices
      .getDisplayMedia({
        video: displayConstraints.video,
        audio: displayConstraints.audio,
      })
      .catch(async () => {
        // getDesktop(cb);
        return getScreenStream(cb);
        // alert("Couldn't get Screen");
      });
    // const videoTrack = stream.getVideoTracks();
    // console.log(videoTrack);
    cb(stream);
  };
  /*
  // electron desktopCapturer
  const getDesktop = (cb) => {
    desktopCapturer
      .getSources({ types: ["screen", "window"] }) //"window", "screen", "tap"
      .then(async (sources) => {
        // for (const src of sources) {
        for (const [idx, src] of sources.entries()) {
          console.log(
            `%c${
              Object.entries(src)
                .reduce((a, e) => {
                  if (typeof e[1] != "function") {
                    a += `"${e[0]}" : "${e[1]}", `;
                  }
                  return a;
                }, "`{")
                .slice(1, -2) + "}`"
            }`,
            "color:black;font-family:system-ui;-webkit-text-stroke: 1px orange;font-weight:bold"
          );
          // if (src.name === "Electron" || src.name === "Entire Screen") {
          if (idx === count) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: src.id, //
                    minWidth: 1280, // size
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720,
                    maxFrameRate: 60, // fps
                    minFrameRate: 1, //
                  },
                },
                audio: false,
              });
              cb(stream);
              //   setSource(stream);
              //   tag.current.srcObject = stream;
              // handleStream(stream);
            } catch (e) {
              console.log(e);
            }
            // return;
          }
        }
      });
  };
  */
  const getScreen = () => {
    if (source) stop();
    try {
      // getScreenStream((stream) => {
      getDisplay((stream) => {
        // const video = document.querySelector("video");
        // video.srcObject = stream;
        console.log("screen stream:", stream);
        if (stream) {
          setSource(stream);
          videoTag.current.srcObject = stream;
        }
        // setSource(true);
      });
    } catch {
      alert("화면을 가져올 수 없습니다.");
    }
  };
  const stop = () => {
    // videoTag.current.srcObject = null;
    source.getTracks().forEach((track) => track.stop());
    setSource(false);
  };
  const camConstraints = {
    video: {
      width: { min: 1080, ideal: 1920 },
      height: { min: 720, ideal: 1280 },
      // optional: [{ frameRate: 60 }, { facingMode: "user" }],
    },
    audio: {
      sampleSize: 8, // 샘플 byte 단위
      echoCancellation: true,
      noiseSuppression: true,
    },
  };

  const getCam = () => {
    if (source) stop();
    if (hasGetUserMedia()) {
      navigator.mediaDevices
        .getUserMedia({
          video: camConstraints.video,
          audio: camConstraints.audio,
        })
        .then((mediaStream) => {
          /*
          var video = document.querySelector("video");
          video.srcObject = mediaStream;
          video.onloadedmetadata = function (e) {
            video.play();
          };
          */
          setSource(mediaStream);
          videoTag.current.srcObject = mediaStream;
        })
        .catch(function (err) {
          console.log(err.name + ": " + err.message);
        }); // always check for errors at the end.
    } else {
      alert("카메라를 찾을 수 없습니다.");
    }
  };
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      // setLocation(position);
    });
  };
  useEffect(() => {
    socketConnect();
    if (source) {
      source.getVideoTracks()[0].onended = (e) => {
        //oninactive , onended
        console.log(e);
        stop();
        alert("화면 공유를 중지하였습니다.");
      };
    }
  });
  return (
    <div>
      <Fragment>
        <input
          onChange={(e) => {
            setCount(parseInt(e.target.value));
          }}
          value={count}
          placeholder="select screen number"
        />
      </Fragment>
      <Fragment>
        <button onClick={getScreen}>getScreen</button>
        <button onClick={getCam}>getCam</button>
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
      {/* <ReactPlayer url={source} autoPlay /> */}
    </div>
  );
};

export default Screen;
