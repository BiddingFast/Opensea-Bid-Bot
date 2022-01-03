const opensea = require("opensea-js");
const config = require("./config.json");

const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;
const hdwalletProvider = require("hdwalletprovider");
const { NumberPrompt, BooleanPrompt } = require("enquirer");

try {
  const providerEngine = new hdwalletProvider({
    privateKeys: [config.PRIVATE_KEY],
    providerOrUrl: "wss://mainnet.infura.io/ws/v3/" + config.INFURA_KEY,
  });

  const seaport = new OpenSeaPort(
    providerEngine,
    {
      networkName: config.TESTNET ? Network.Rinkeby : Network.Main,
      apiKey: "",
    },
    (arg) => console.log(arg)
  );

  const wethAmountPrompt = new NumberPrompt({
    name: "WETH Amount",
    message: "Please enter the WETH amount",
  });
  const expirationTimePrompt = new NumberPrompt({
    name: "expirationTime",
    message: "Please enter the expiration time in hours",
  });

  async function main() {
    let expirationTime = await expirationTimePrompt.run().catch(function (err) {
      return 0;
    });
    if (expirationTime == 0) {
      console.log("You need to set a number larger than 0");
      process.exit(1);
    }
    let wethAmount = await wethAmountPrompt.run().catch(function (err) {
      return 0;
    });
    if (wethAmount == 0) {
      console.log("You need to set a number larger than 0");
      process.exit(1);
    }

    const lastCheckPrompt = new BooleanPrompt({
      header: "========================",
      message: `Are you sure you want to bid ${config.End - config.Start} NFT with ${wethAmount} WETH and to expire after ${expirationTime} hour?`,
      footer: "========================",
    });

    let lastCheck = await lastCheckPrompt.run().catch(function (err) {
      return false;
    });
    if (!lastCheck == true) {
      console.log("Operation cancelled");
      process.exit(1);
    }
    for (let index = config.Start; index < config.End; index++) {
      try {
        var ETHContract = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
        const offer = await seaport.createBuyOrder({
          asset: {
            tokenId: index.toString(),
          },
          startAmount: wethAmount,
          expirationTime: Math.floor(Date.now() / 1000) + expirationTime * 60 * 60,
          paymentTokenAddress: ETHContract,
        });
        console.log(`Successfully created an offer${index}!\n`);
      } catch (error) {
        console.log(error);
        process.exit();
      }
    }
  }
  main();
} catch (e) {
  console.log("Error , private or infura key not valid.");
  console.log("Replace and try again, if it wont work, the bot is outdated/old.");
  console.log(e);
  process.exit();
}
