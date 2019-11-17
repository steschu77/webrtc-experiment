/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

start();

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
  localVideo.srcObject = stream;

  const configuration = {};
  let pc1 = new RTCPeerConnection(configuration);
  let pc2 = new RTCPeerConnection(configuration);

  pc1.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
  pc2.addEventListener('icecandidate', e => onIceCandidate(pc1, e));
  pc2.addEventListener('track', gotRemoteStream);

  stream.getTracks().forEach(track => pc1.addTrack(track, stream));

  const offer = await pc1.createOffer(offerOptions);
  await pc1.setLocalDescription(offer);
  await pc2.setRemoteDescription(offer);

  const answer = await pc2.createAnswer();
  await pc2.setLocalDescription(answer);
  await pc1.setRemoteDescription(answer);
}

function gotRemoteStream(e) {
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
  }
}

async function onIceCandidate(pc, event) {
  await pc.addIceCandidate(event.candidate);
}
