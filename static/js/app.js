const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let peersStream;
let muted = false;
let cameraOn = true;
let currentRoomName;
/** @type {RTCPeerConnection} */
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
    await getCameras();
  } catch (e) {
    console.log(e);
  }
}

//getMedia();

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  muted = !muted;
  if (muted) {
    muteBtn.innerText = "Unmute";
  } else muteBtn.innerText = "Mute";
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  cameraOn = !cameraOn;
  if (cameraOn) cameraBtn.innerText = "Turn Camera Off";
  else cameraBtn.innerText = "Turn Camera On";
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

async function handleCameraChange() {
  console.log("camera change");
  // if (camerasSelect.value == "screen") {
  //   console.log("화면 공유");
  //   startScreenSharing();
  //   return;
  // }

  // console.log(camerasSelect.value);
  // await getMedia(camerasSelect.value);
  // if (myPeerConnection) {
  //   const videoTrack = myStream.getVideoTracks()[0];
  //   const videoSender = myPeerConnection
  //     .getSenders()
  //     .find((sender) => sender.track.kind === "video");
  //   videoSender.replaceTrack(videoTrack);
  // }
}

const welcomeForm = welcome.querySelector("form");

async function initCall() {
  console.log("init call");
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  currentRoomName = input.value;
  input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket code

socket.on("welcome", async () => {
  console.log("got weclome event");
  const offer = await myPeerConnection.createOffer();
  //myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, currentRoomName);
});

socket.on("offer", async (offer) => {
  console.log("received the offer");
  console.log(offer);
  // myPeerConnection.setRemoteDescription(offer);
  // const answer = await myPeerConnection.createAnswer();
  // myPeerConnection.setLocalDescription(answer);
  // socket.emit("answer", answer, currentRoomName);
  // console.log("sent the answer");
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
  console.log("received the offer");
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit("ice", data.candidate, currentRoomName);
  console.log("sent candidate");
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  console.log("got an event from my peer");
  peerFace.srcObject = data.stream;
}
