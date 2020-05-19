import React, { Fragment, useEffect, useState, useRef } from "react"; //useEffect, useState
import Capture from "Utils/Capture";

import { ButtonGroup, Button, Card, CardBody, CardHeader } from "reactstrap";
const { isScreenCapturingSupported, screenCapture } = Capture;

// import { getDesktop } from "./desktopCapture";
// const electron = window.require("electron");
// const desktopCapturer = electron.desktopCapturer;

// import ReactPlayer from "react-player";
// import Player from "video-react";

const Screen = ({ socket }) => {
  const [source, setSource] = useState(false);
  const [users, setUsers] = useState([]);
  const videoTag = useRef();

  // const { RTCPeerConnection, RTCSessionDescription } = window;
  const peerConnection = new RTCPeerConnection();

  //redux를 이용 할것
  let isAlreadyCalling = false;

  peerConnection.ontrack = ({ streams: [stream] }) => {
    // remote-video
    /*
    if (remoteTag) {
      remoteTag.current.srcObject = stream;
    }
    */
    const remoteVideo = document.querySelector(".remote-video");
    if (remoteVideo) {
      remoteVideo.srcObject = stream;
    }
  };
  /*
  let pc; // peer connection
  const start = (isCaller) => {
    // run start(true) to initiate a call

    // send any ice candidates to the other peer
    // pc = new RTCPeerConnection("http://127.0.0.1:5000"); // iceServer config
    pc = new peerConnection();

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
     
    
    
    // main.js
    // let localPeerConnection;
    // localPeerConnection = new RTCPeerConnection();  //servers
    // localPeerConnection.addEventListener('icecandidate', handleConnection);
    // localPeerConnection.addEventListener(
    //   'iceconnectionstatechange', handleConnectionChange);
    // };
     */

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
      maxFrameRate: 5,
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
      screenCapture(
        session,
        (stream) => {
          console.log("screen stream:", stream);

          /*
          setSource(stream);
          videoTag.current.srcObject = stream;
          localTag.current.srcObject = stream;
          */
          const localVideo = document.querySelector(".local-video");
          if (localVideo) {
            // localVideo.srcObject = stream;
            videoTag.srcObject = stream;
          }

          // p2p stream
          stream
            .getTracks()
            .forEach((track) => peerConnection.addTrack(track, stream));
        },
        (err) => {
          console.warn(err);
          alert("화면을 가져오는 과정에서 오류가 발생하였습니다.");
        }
      );
    } else {
      alert("화면을 가져올 수 없습니다. (미지원)");
    }
  };
  const stop = () => {
    // videoTag.current.srcObject = null;
    source.getTracks().forEach((track) => track.stop());
    setSource(false);
  };

  // 특정 유저와 p2p 연결하기
  const callUser = async (socketId) => {
    const offer = await peerConnection.createOffer();
    /*  // updateCodec - modify sdp function / createAnswer도 같이 추가할 것
    .then(function(offer) {
      const sdp = offer.sdp;
      const changedsdp = updateCodec(sdp) //Function to modify the sdp
      offer.sdp = changedsdp

      peerConnection.setLocalDescription(offer)})
      */
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    // console.log("callUser:", socketId, offer);

    socket.emit("call-user", {
      offer,
      to: socketId,
    });
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
      console.log("socketId:", socket.id);
      /*
      socket.on("message", (evt) => {
        if (!pc) {
          start(false);
          let signal = JSON.parse(evt.data);
          if (signal.sdp)
            pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          else pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      });
      */
      // 자신 이외 소켓 목록
      socket.on("update-user-list", (data) => {
        setUsers([...users, ...data.users]);
      });
      // 연결 해제된 소켓
      socket.on("remove-user", ({ socketId }) => {
        const list = users.filter((socket) => socket !== socketId);
        setUsers(list);
      });
      // 타 유저와 peer 연결요청 받음 (- signaling server)
      socket.on("call-made", async (data) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(
          new RTCSessionDescription(answer)
        );

        // 요청 응답
        socket.emit("make-answer", {
          answer,
          to: data.socket,
        });
      });
      socket.on("answer-made", async (data) => {
        console.log("answer-made");
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        if (!isAlreadyCalling) {
          callUser(data.socket);
          isAlreadyCalling = true;
        }

        // callUser(data.socket);
      });
    }

    return () => {
      if (socket) {
        // socket.off("message");
        socket.off("update-user-list");
        socket.off("remove-user");
        socket.off("call-made");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <div>
      <Fragment>
        <Button className="bg-primary" onClick={getScreen}>
          getScreen
        </Button>
        {!!source && <button onClick={stop}>stop</button>}
      </Fragment>

      <Fragment>
        <Card outline color="primary">
          <CardHeader>User List</CardHeader>
          <CardBody>
            <ButtonGroup>
              {users.length !== 0 &&
                users.map((user, index) => (
                  <Button
                    key={index}
                    color="primary"
                    outline
                    onClick={() => callUser(user)}
                    size="sm"
                  >
                    {user}
                  </Button>
                ))}
            </ButtonGroup>
          </CardBody>
        </Card>
      </Fragment>

      {
        <div>
          <video
            title="Screen Share"
            id="video"
            className="local-video remote-video"
            // ref={(video) => {
            //   if (!!source) {
            //     video.srcObject = source;
            //   }
            // }}
            ref={videoTag}
            // src={source}
            autoPlay
            playsInline
            // controls
            preload="metadata"
            // height={!!source ? "50%" : "0%"}
            // width={!!source ? "100%" : "0%"}
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
              console.log(e.target);
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
      }
      <hr />
      <Fragment>
        {/* p2p 통실할 영상 */}
        <video autoPlay playsInline></video>
        {/* 받은 영상 */}
        {/* <video class="remote-video" autoPlay playsInline></video> */}
        {/* 
        <div>
          <button id="startButton">Start</button>
          <button id="callButton">Call</button>
          <button id="hangupButton">Hang Up</button>
        </div>
         */}
      </Fragment>
    </div>
  );
};

export default Screen;
