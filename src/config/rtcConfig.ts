// Hide keys in the future

const configuration = {
  iceServers: [
    {
      urls: [
        "stun:stun.relay.metered.ca:80",
        "stun:stun.relay.metered.ca:443",
      ],
    },
    {
      urls: [
        "turn:eu.relay.metered.ca:80",
        "turn:eu.relay.metered.ca:443",
        "turn:eu.relay.metered.ca:443?transport=tcp",
      ],
      username: "146f499dbe6ba26f594821fa",
      credential: "HFkkVaeSA3kpVmoO",
    },
  ],
};

export default configuration

