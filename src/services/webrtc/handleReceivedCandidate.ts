export default async function handleReceivedCandidate(pc: RTCPeerConnection, candidate: RTCIceCandidate) {
  console.log('in handleReceivedCandidate')
  if (candidate && pc.remoteDescription?.type) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

}