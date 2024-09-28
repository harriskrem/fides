// Hide keys in the future
const configuration = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "146f499dbe6ba26f594821fa",
      credential: "HFkkVaeSA3kpVmoO",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "146f499dbe6ba26f594821fa",
      credential: "HFkkVaeSA3kpVmoO",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "146f499dbe6ba26f594821fa",
      credential: "HFkkVaeSA3kpVmoO",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "146f499dbe6ba26f594821fa",
      credential: "HFkkVaeSA3kpVmoO",
    },
  ],
}

export default configuration

