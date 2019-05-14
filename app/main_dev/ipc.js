import fs from "fs-extra";
import path from "path";
import parseArgs from "minimist";
import { OPTIONS } from "./constants";
import { createLogger } from "./logging";
import { getWalletPath, getWalletDBPathFromWallets, getFnodPath, fnodCfg, fnoctlCfg, appDataDirectory, getExecutablePath, getFnodRpcCert } from "./paths";
import { createTempFnodConf, initWalletCfg, newWalletConfigCreation, getWalletCfg, readFnodConfig } from "../config";
import { launchFNOD, launchFNOWallet, GetFnodPID, GetFnowPID, closeFNOD, closeFNOW, GetFnowPort } from "./launch";

const argv = parseArgs(process.argv.slice(1), OPTIONS);
const logger = createLogger();
let watchingOnlyWallet;

export const getAvailableWallets = (network) => {
  // Attempt to find all currently available wallet.db's in the respective network direction in each wallets data dir
  const availableWallets = [];
  const isTestNet = network !== "mainnet";

  const walletsBasePath = getWalletPath(isTestNet);
  const walletDirs = fs.readdirSync(walletsBasePath);
  walletDirs.forEach(wallet => {
    const walletDirStat = fs.statSync(path.join(walletsBasePath, wallet));
    if (!walletDirStat.isDirectory()) return;

    const cfg = getWalletCfg(isTestNet, wallet);
    const lastAccess = cfg.get("lastaccess");
    const watchingOnly = cfg.get("iswatchonly");
    const isTrezor = cfg.get("trezor");
    const walletDbFilePath = getWalletDBPathFromWallets(isTestNet, wallet);
    const finished = fs.pathExistsSync(walletDbFilePath);
    availableWallets.push({ network, wallet, finished, lastAccess, watchingOnly, isTrezor });
  });

  return availableWallets;
};

export const deleteDaemon = (appData, testnet) => {
  let removeDaemonDirectory = getFnodPath();
  if (appData) removeDaemonDirectory = appData;
  let removeDaemonDirectoryData = path.join(removeDaemonDirectory, "data", testnet ? "testnet3" : "mainnet");
  try {
    if (fs.pathExistsSync(removeDaemonDirectoryData)) {
      fs.removeSync(removeDaemonDirectoryData);
      logger.log("info", "removing " + removeDaemonDirectoryData);
    }
    return true;
  } catch (e) {
    logger.log("error", "error deleting daemon data: " + e);
    return false;
  }
};

export const startDaemon = (mainWindow, daemonIsAdvanced, primaryInstance, appData, testnet, reactIPC) => {
  if (GetFnodPID() && GetFnodPID() !== -1) {
    logger.log("info", "Skipping restart of daemon as it is already running " + GetFnodPID());
    var newConfig = {};
    if (appData) {
      newConfig = readFnodConfig(appData, testnet);
      newConfig.rpc_cert = getFnodRpcCert(appData);
    } else {
      newConfig = readFnodConfig(getFnodPath(), testnet);
      newConfig.rpc_cert = getFnodRpcCert();
    }
    newConfig.pid =  GetFnodPID();
    return newConfig;
  }
  if(appData){
    logger.log("info", "launching fnod with different appdata directory");
  }
  if (!daemonIsAdvanced && !primaryInstance) {
    logger.log("info", "Running on secondary instance. Assuming fnod is already running.");
    let fnodConfPath = getFnodPath();
    if (!fs.existsSync(fnodCfg(fnodConfPath))) {
      fnodConfPath = createTempFnodConf();
    }
    return -1;
  }
  try {
    let fnodConfPath = getFnodPath();
    if (!fs.existsSync(fnodCfg(fnodConfPath))) {
      fnodConfPath = createTempFnodConf();
    }
    return launchFNOD(mainWindow, daemonIsAdvanced, fnodConfPath, appData, testnet, reactIPC);
  } catch (e) {
    logger.log("error", "error launching fnod: " + e);
  }
};

export const createWallet = (testnet, walletPath) => {
  const newWalletDirectory = getWalletPath(testnet, walletPath);
  try {
    if (!fs.pathExistsSync(newWalletDirectory)){
      fs.mkdirsSync(newWalletDirectory);

      // create new configs for new wallet
      initWalletCfg(testnet, walletPath);
      newWalletConfigCreation(testnet, walletPath);
    }
    return true;
  } catch (e) {
    logger.log("error", "error creating wallet: " + e);
    return false;
  }
};

export const removeWallet = (testnet, walletPath) => {
  let removeWalletDirectory = getWalletPath(testnet, walletPath);
  try {
    if (fs.pathExistsSync(removeWalletDirectory)) {
      fs.removeSync(removeWalletDirectory);
    }
    return true;
  } catch (e) {
    logger.log("error", "error creating wallet: " + e);
    return false;
  }
};

export const startWallet = (mainWindow, daemonIsAdvanced, testnet, walletPath, reactIPC) => {
  if (GetFnowPID()) {
    logger.log("info", "fnowallet already started " + GetFnowPID());
    mainWindow.webContents.send("fnowallet-port", GetFnowPort());
    return GetFnowPID();
  }
  initWalletCfg(testnet, walletPath);
  try {
    return launchFNOWallet(mainWindow, daemonIsAdvanced, walletPath, testnet, reactIPC);
  } catch (e) {
    logger.log("error", "error launching fnowallet: " + e);
  }
};

export const stopDaemon = () => {
  return closeFNOD(GetFnodPID());
};

export const stopWallet = () => {
  return closeFNOW(GetFnowPID());
};

export const getDaemonInfo = (mainWindow, rpcCreds, isRetry) => {
  let args = [ "getinfo" ];

  if (!rpcCreds){
    args.push(`--configfile=${fnoctlCfg(appDataDirectory())}`);
  } else if (rpcCreds) {
    if (rpcCreds.rpc_user) {
      args.push(`--rpcuser=${rpcCreds.rpc_user}`);
    }
    if (rpcCreds.rpc_password) {
      args.push(`--rpcpass=${rpcCreds.rpc_password}`);
    }
    if (rpcCreds.rpc_cert) {
      args.push(`--rpccert=${rpcCreds.rpc_cert}`);
    }
  }

  // retry using testnet to check connection
  if (isRetry) {
    args.push("--testnet");
  }

  const fnoctlExe = getExecutablePath("fnoctl", argv.customBinPath);
  if (!fs.existsSync(fnoctlExe)) {
    logger.log("error", "The fnoctl executable does not exist. Expected to find it at " + fnoctlExe);
  }

  logger.log("info", `checking daemon network with fnoctl ${args}`);

  const spawn = require("child_process").spawn;
  const fnoctl = spawn(fnoctlExe, args, { detached: false, stdio: [ "ignore", "pipe", "pipe", "pipe" ] });

  fnoctl.stdout.on("data", (data) => {
    const parsedData = JSON.parse(data);
    logger.log("info", "is daemon testnet: " + parsedData.testnet);
    mainWindow.webContents.send("check-getinfo-response", parsedData);
  });
  fnoctl.stderr.on("data", (data) => {
    logger.log("error", data.toString());
    if (isRetry) {
      mainWindow.webContents.send("check-getinfo-response", null );
    } else {
      getDaemonInfo(mainWindow, rpcCreds, true);
    }
  });
};

export const checkDaemon = (mainWindow, rpcCreds, testnet) => {
  let args = [ "getblockchaininfo" ];
  let host, port;

  if (!rpcCreds){
    args.push(`--configfile=${fnoctlCfg(appDataDirectory())}`);
  } else if (rpcCreds) {
    if (rpcCreds.rpc_user) {
      args.push(`--rpcuser=${rpcCreds.rpc_user}`);
    }
    if (rpcCreds.rpc_password) {
      args.push(`--rpcpass=${rpcCreds.rpc_password}`);
    }
    if (rpcCreds.rpc_cert) {
      args.push(`--rpccert=${rpcCreds.rpc_cert}`);
    }
    if (rpcCreds.rpc_host) {
      host = rpcCreds.rpc_host;
    }
    if (rpcCreds.rpc_port) {
      port = rpcCreds.rpc_port;
    }
    args.push("--rpcserver=" + host + ":" + port);
  }

  if (testnet) {
    args.push("--testnet");
  }

  const fnoctlExe = getExecutablePath("fnoctl", argv.customBinPath);
  if (!fs.existsSync(fnoctlExe)) {
    logger.log("error", "The fnoctl executable does not exist. Expected to find it at " + fnoctlExe);
  }

  logger.log("info", `checking if daemon is ready  with fnoctl ${args}`);

  const spawn = require("child_process").spawn;
  const fnoctl = spawn(fnoctlExe, args, { detached: false, stdio: [ "ignore", "pipe", "pipe", "pipe" ] });

  fnoctl.stdout.on("data", (data) => {
    const parsedData = JSON.parse(data);
    const blockCount = parsedData.blocks;
    const syncHeight = parsedData.syncheight;
    logger.log("info", parsedData.blocks, parsedData.syncheight, parsedData.verificationprogress);
    mainWindow.webContents.send("check-daemon-response", { blockCount, syncHeight });
  });
  fnoctl.stderr.on("data", (data) => {
    logger.log("error", data.toString());
    mainWindow.webContents.send("check-daemon-response", { blockCount: 0, syncHeight: 0 });
  });
};

export const setWatchingOnlyWallet = (isWatchingOnly) => {
  watchingOnlyWallet = isWatchingOnly;
};

export const getWatchingOnlyWallet = () => watchingOnlyWallet;
