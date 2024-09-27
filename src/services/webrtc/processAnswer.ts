export default async function processAnswer(pc: RTCPeerConnection, answer: RTCSessionDescriptionInit) {
  console.log('processing Answer')
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
  console.log('processed Answer')
}