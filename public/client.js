const socket = io("/");
const videoGrid = document.getElementById("videos_grid");
const myPeer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443"
});
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
    });
    socket.on("user-connected", (userId) => {
        connectToNewUser(userId, stream);
    });
});

socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
        video.remove();
    });
    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videoGrid.append(video);
}

function muteUnmute() {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
       setUnMuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}

function playStop() {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopVideo();
    }
}

function setMuteButton() {
    const html = `<i class="fas fa-microphone meet_actions_button_icon meet_actions_button_icon_activate"></i>`;
    document.querySelector(".mute_button").innerHTML = html;
}

function setUnMuteButton() {
    const html = `<i class="fas fa-microphone-slash meet_actions_button_icon meet_actions_button_icon_desactivate"></i>`;
    document.querySelector(".mute_button").innerHTML = html;
}

function setStopVideo() {
    const html = `<i class="fas fa-video meet_actions_button_icon meet_actions_button_icon_activate"></i>`;
    document.querySelector(".camera_button").innerHTML = html;
}

function setPlayVideo() {
    const html = `<i class="fas fa-video-slash meet_actions_button_icon meet_actions_button_icon_desactivate"></i>`;
    document.querySelector(".camera_button").innerHTML = html;
}