export default async function processAnswer(pc: RTCPeerConnection, answer: RTCSessionDescriptionInit) {
  console.log('in answerProcess')
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}