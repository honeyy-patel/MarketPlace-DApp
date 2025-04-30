module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Connects to any network
    },
  },
  compilers: {
    solc: {
      version: "0.8.20", // Change this based on your Solidity version
    },
  },
};

