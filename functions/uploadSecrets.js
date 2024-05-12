const { SecretsManager } = require("@chainlink/functions-toolkit");
const ethers = require("ethers");

async function uploadSecrets() {
  const routerAddress = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
  const donId = "fun-ethereum-sepolia-1";
  const gatewayUrls = [
    "https://01.functions-gateway.testnet.chain.link/",
    "https://02.functions-gateway.testnet.chain.link/",
  ];
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const secrets = {
    alpacaKey: process.env.ALPACA_API_KEY,
    alpacaSecret: process.env.ALPACA_SECRET_KEY,
  };

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider);

  const secretsManager = new SecretsManager({
    signer,
    functionsRouterAddress: routerAddress,
    donId,
  });
  await secretsManager.initialize();

  const encryptedSecrets = await secretsManager.encryptSecrets(secrets);
  console.log(encryptedSecrets);
  const slotIdNumber = 0;
  const expirationTimeMinutes = 1440;

  const uploadResult = await SecretsManager.uploadEncryptedSecretsToDON({
    encryptedSecretsHexString: encryptedSecrets.encryptedSecrets,
    gatewayUrls: gatewayUrls,
    slotId: slotIdNumber,
    minutesUntilExpiration: expirationTimeMinutes,
  });

  if (!uploadResult.success) {
    throw new Error(`Failed to upload secrets: ${uploadResult.error}`);
  }

  console.log(`Secrets uploaded successfully , response: ${uploadResult}`);
  const donHostedSecretsVersion = parseInt(uploadResult.version);
  console.log(donHostedSecretsVersion);
}

uploadSecrets().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
