const hre = require("hardhat");
const fs = require('fs');
const fse = require("fs-extra");
const { verify } = require('../utils/verify');

const LOCAL_NETWORKS = ["localhost", "ganache"];

async function deployMock() {
  const DECIMALS = "8";
  const INITIAL_PRICE = "200000000000";

  const Mock = await hre.ethers.getContractFactory("MockV3Aggregator");

  console.log("Deploying price feed mock");

  try {
  const mockContract = await Mock.deploy(DECIMALS, INITIAL_PRICE);

  await mockContract.deployed();
  console.log("Price feed mock deployed to:", mockContract.address);

  return mockContract.address;
}  catch (error) {
  console.error("Error deploying price feed mock:", error);
  throw error; // Rethrow the error to handle it in the main function
}
}

async function main() {
  const deployNetwork = hre.network.name;

  let courseCreationFee = hre.ethers.utils.parseEther("0.001", "ether");
  var priceFeedAddress;
  if (LOCAL_NETWORKS.includes(hre.network.name)) {
    priceFeedAddress = await deployMock();
  }
  // For deploying to polygon mainnet or testnet
  // const priceFeedAddress = ""

  const DecentralUdemy = await hre.ethers.getContractFactory("DecentralUdemy");
  const decentralUdemy = await DecentralUdemy.deploy(courseCreationFee, priceFeedAddress);

  await decentralUdemy.deployed();

  console.log("DecentralUdemy deployed to:", decentralUdemy.address);
  console.log("Network deployed to:", deployNetwork);

  /* transfer contracts addresses & ABIs to the front-end */
  if (fs.existsSync("../front-end/src")) {
    fs.rmSync("../front-end/src/artifacts", { recursive: true, force: true });
    fse.copySync("./artifacts/contracts", "../front-end/src/artifacts");
    fs.writeFileSync('../front-end/src/utils/contracts-config.js', `
    export const contractAddress = "${decentralUdemy.address}"
    export const ownerAddress = "${decentralUdemy.signer.address}"
    export const networkDeployedTo = "${hre.network.config.chainId}"
    `)
  }

  if (
    !LOCAL_NETWORKS.includes(hre.network.name) &&
    hre.config.etherscan.apiKey !== ""
  ) {
    console.log("waiting for 6 blocks verification ...")
    await decentralUdemy.deployTransaction.wait(6)

    // args represent contract constructor arguments
    const args = [courseCreationFee, priceFeedAddress];
    await verify(decentralUdemy.address, args)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
