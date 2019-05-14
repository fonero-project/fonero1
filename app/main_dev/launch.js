import { fnowalletCfg, getWalletPath, getExecutablePath, fnodCfg, getFnodRpcCert } from "./paths";
import { getWalletCfg, readFnodConfig } from "../config";
import { createLogger, AddToFnodLog, AddToFnowalletLog, GetFnodLogs,
  GetFnowalletLogs, lastErrorLine, lastPanicLine, ClearFnowalletLogs, CheckDaemonLogs } from "./logging";
import parseArgs from "minimist";
import { OPTIONS } from "./constants";
import os from "os";
import fs from "fs-extra";
import stringArgv from "string-argv";
import { concat, isString } from "lodash";

const argv = parseArgs(process.argv.slice(1), OPTIONS);
const debug = argv.debug || process.env.NODE_ENV === "development";
const logger = createLogger(debug);

let fnodPID;
let fnowPID;

// windows-only stuff
let fnowPipeRx;
let fnodPipeRx;

let fnowPort;

function closeClis() {
  // shutdown daemon and wallet.
  // Don't try to close if not running.
  if(fnodPID && fnodPID !== -1)
    closeFNOD(fnodPID);
  if(fnowPID && fnowPID !== -1)
    closeFNOW(fnowPID);
}

export function closeFNOD() {
  if (require("is-running")(fnodPID) && os.platform() != "win32") {
    logger.log("info", "Sending SIGINT to fnod at pid:" + fnodPID);
    process.kill(fnodPID, "SIGINT");
    fnodPID = null;
  } else if (require("is-running")(fnodPID)) {
    try {
      const win32ipc = require("../node_modules/win32ipc/build/Release/win32ipc.node");
      win32ipc.closePipe(fnodPipeRx);
      fnodPID = null;
    } catch (e) {
      logger.log("error", "Error closing fnod piperx: " + e);
      return false;
    }
  }
  return true;
}

export const closeFNOW = () => {
  try {
    if (require("is-running")(fnowPID) && os.platform() != "win32") {
      logger.log("info", "Sending SIGINT to fnowallet at pid:" + fnowPID);
      process.kill(fnowPID, "SIGINT");
    } else if (require("is-running")(fnowPID)) {
      try {
        const win32ipc = require("../node_modules/win32ipc/build/Release/win32ipc.node");
        win32ipc.closePipe(fnowPipeRx);
      } catch (e) {
        logger.log("error", "Error closing fnowallet piperx: " + e);
      }
    }
    fnowPID = null;
    return true;
  } catch (e) {
    logger.log("error", "error closing wallet: " + e);
    return false;
  }
};

export async function cleanShutdown(mainWindow, app) {
  // Attempt a clean shutdown.
  return new Promise(resolve => {
    const cliShutDownPause = 2; // in seconds.
    const shutDownPause = 3; // in seconds.
    closeClis();
    // Sent shutdown message again as we have seen it missed in the past if they
    // are still running.
    setTimeout(function () { closeClis(); }, cliShutDownPause * 1000);
    logger.log("info", "Closing fonero.");

    let shutdownTimer = setInterval(function () {
      const stillRunning = (require("is-running")(fnodPID) && os.platform() != "win32");

      if (!stillRunning) {
        logger.log("info", "Final shutdown pause. Quitting app.");
        clearInterval(shutdownTimer);
        if (mainWindow) {
          mainWindow.webContents.send("daemon-stopped");
          setTimeout(() => { mainWindow.close(); app.quit(); }, 1000);
        } else {
          app.quit();
        }
        resolve(true);
      }
      logger.log("info", "Daemon still running in final shutdown pause. Waiting.");

    }, shutDownPause * 1000);
  });
}

export const launchFNOD = (mainWindow, daemonIsAdvanced, daemonPath, appdata, testnet, reactIPC) => {
  const spawn = require("child_process").spawn;
  let args = [ "--nolisten" ];
  let newConfig = {};
  if (appdata) {
    args.push(`--appdata=${appdata}`);
    newConfig = readFnodConfig(appdata, testnet);
    newConfig.rpc_cert = getFnodRpcCert(appdata);
  } else {
    args.push(`--configfile=${fnodCfg(daemonPath)}`);
    newConfig = readFnodConfig(daemonPath, testnet);
    newConfig.rpc_cert = getFnodRpcCert();
  }
  if (testnet) {
    args.push("--testnet");
  }

  const fnodExe = getExecutablePath("fnod", argv.customBinPath);
  if (!fs.existsSync(fnodExe)) {
    logger.log("error", "The fnod executable does not exist. Expected to find it at " + fnodExe);
    return;
  }

  if (os.platform() == "win32") {
    try {
      const util = require("util");
      const win32ipc = require("../node_modules/win32ipc/build/Release/win32ipc.node");
      fnodPipeRx = win32ipc.createPipe("out");
      args.push(util.format("--piperx=%d", fnodPipeRx.readEnd));
    } catch (e) {
      logger.log("error", "can't find proper module to launch fnod: " + e);
    }
  }

  logger.log("info", `Starting ${fnodExe} with ${args}`);

  const fnod = spawn(fnodExe, args, {
    detached: os.platform() == "win32",
    stdio: [ "ignore", "pipe", "pipe" ]
  });

  fnod.on("error", function (err) {
    logger.log("error", "Error running fnod.  Check logs and restart! " + err);
    mainWindow.webContents.executeJavaScript("alert(\"Error running fnod.  Check logs and restart! " + err + "\");");
    mainWindow.webContents.executeJavaScript("window.close();");
  });

  fnod.on("close", (code) => {
    if (daemonIsAdvanced)
      return;
    if (code !== 0) {
      var lastFnodErr = lastErrorLine(GetFnodLogs());
      if (!lastFnodErr || lastFnodErr == "") {
        lastFnodErr = lastPanicLine(GetFnodLogs());
        console.log("panic error", lastFnodErr);
      }
      logger.log("error", "fnod closed due to an error: ", lastFnodErr);
      reactIPC.send("error-received", true, lastFnodErr);
    } else {
      logger.log("info", `fnod exited with code ${code}`);
    }
  });

  fnod.stdout.on("data", (data) => {
    AddToFnodLog(process.stdout, data, debug);
    if (CheckDaemonLogs(data)) {
      reactIPC.send("warning-received", true, data.toString("utf-8"));
    }
  });
  fnod.stderr.on("data", (data) => AddToFnodLog(process.stderr, data, debug));

  newConfig.pid = fnod.pid;
  fnodPID = fnod.pid;
  logger.log("info", "fnod started with pid:" + newConfig.pid);

  fnod.unref();
  return newConfig;
};

// DecodeDaemonIPCData decodes messages from an IPC message received from fnod/
// fnowallet using their internal IPC protocol.
// NOTE: very simple impl for the moment, will break if messages get split
// between data calls.
const DecodeDaemonIPCData = (logger, data, cb) => {
  let i = 0;
  while (i < data.length) {
    if (data[i++] !== 0x01) throw "Wrong protocol version when decoding IPC data";
    const mtypelen = data[i++];
    const mtype = data.slice(i, i+mtypelen).toString("utf-8");
    i += mtypelen;
    const psize = data.readUInt32LE(i);
    i += 4;
    const payload = data.slice(i, i+psize);
    i += psize;
    cb(mtype, payload);
  }
};

export const launchFNOWallet = (mainWindow, daemonIsAdvanced, walletPath, testnet, reactIPC) => {
  const spawn = require("child_process").spawn;
  let args = [ "--configfile=" + fnowalletCfg(getWalletPath(testnet, walletPath)) ];

  const cfg = getWalletCfg(testnet, walletPath);

  args.push("--ticketbuyer.nospreadticketpurchases");
  args.push("--ticketbuyer.balancetomaintainabsolute=" + cfg.get("balancetomaintain"));
  args.push("--addridxscanlen=" + cfg.get("gaplimit"));

  const fnowExe = getExecutablePath("fnowallet", argv.customBinPath);
  if (!fs.existsSync(fnowExe)) {
    logger.log("error", "The fnowallet executable does not exist. Expected to find it at " + fnowExe);
    return;
  }

  if (os.platform() == "win32") {
    try {
      const util = require("util");
      const win32ipc = require("../node_modules/win32ipc/build/Release/win32ipc.node");
      fnowPipeRx = win32ipc.createPipe("out");
      args.push(util.format("--piperx=%d", fnowPipeRx.readEnd));
    } catch (e) {
      logger.log("error", "can't find proper module to launch fnowallet: " + e);
    }
  } else {
    args.push("--rpclistenerevents");
    args.push("--pipetx=4");
  }

  // Add any extra args if defined.
  if (argv.extrawalletargs !== undefined && isString(argv.extrawalletargs)) {
    args = concat(args, stringArgv(argv.extrawalletargs));
  }

  logger.log("info", `Starting ${fnowExe} with ${args}`);

  const fnowallet = spawn(fnowExe, args, {
    detached: os.platform() == "win32",
    stdio: [ "ignore", "pipe", "pipe", "ignore", "pipe" ]
  });

  const notifyGrpcPort = (port) => {
    fnowPort = port;
    logger.log("info", "wallet grpc running on port", port);
    mainWindow.webContents.send("fnowallet-port", port);
  };

  fnowallet.stdio[4].on("data", (data) => DecodeDaemonIPCData(logger, data, (mtype, payload) => {
    if (mtype === "grpclistener") {
      const intf = payload.toString("utf-8");
      const matches = intf.match(/^.+:(\d+)$/);
      if (matches) {
        notifyGrpcPort(matches[1]);
      } else {
        logger.log("error", "GRPC port not found on IPC channel to fnowallet: " + intf);
      }
    }
  }));

  fnowallet.on("error", function (err) {
    logger.log("error", "Error running fnowallet.  Check logs and restart! " + err);
    mainWindow.webContents.executeJavaScript("alert(\"Error running fnowallet.  Check logs and restart! " + err + "\");");
    mainWindow.webContents.executeJavaScript("window.close();");
  });

  fnowallet.on("close", (code) => {
    if (daemonIsAdvanced)
      return;
    if (code !== 0) {
      var lastFnowalletErr = lastErrorLine(GetFnowalletLogs());
      if (!lastFnowalletErr || lastFnowalletErr == "") {
        lastFnowalletErr = lastPanicLine(GetFnowalletLogs());
      }
      logger.log("error", "fnowallet closed due to an error: ", lastFnowalletErr);
      reactIPC.send("error-received", false, lastFnowalletErr);
    } else {
      logger.log("info", `fnowallet exited with code ${code}`);
    }
    ClearFnowalletLogs();
  });

  const addStdoutToLogListener = (data) => AddToFnowalletLog(process.stdout, data, debug);

  // waitForGrpcPortListener is added as a stdout on("data") listener only on
  // win32 because so far that's the only way we found to get back the grpc port
  // on that platform. For linux/macOS users, the --pipetx argument is used to
  // provide a pipe back to fonero, which reads the grpc port in a secure and
  // reliable way.
  const waitForGrpcPortListener = (data) => {
    const matches = /FNOW: gRPC server listening on [^ ]+:(\d+)/.exec(data);
    if (matches) {
      notifyGrpcPort(matches[1]);
      // swap the listener since we don't need to keep looking for the port
      fnowallet.stdout.removeListener("data", waitForGrpcPortListener);
      fnowallet.stdout.on("data", addStdoutToLogListener);
    }
    AddToFnowalletLog(process.stdout, data, debug);
  };

  fnowallet.stdout.on("data", os.platform() == "win32" ? waitForGrpcPortListener : addStdoutToLogListener);
  fnowallet.stderr.on("data", (data) => {
    AddToFnowalletLog(process.stderr, data, debug);
  });

  fnowPID = fnowallet.pid;
  logger.log("info", "fnowallet started with pid:" + fnowPID);

  fnowallet.unref();
  return fnowPID;
};

export const GetFnowPort = () => fnowPort;

export const GetFnodPID = () => fnodPID;

export const GetFnowPID = () => fnowPID;

export const readExesVersion = (app, grpcVersions) => {
  let spawn = require("child_process").spawnSync;
  let args = [ "--version" ];
  let exes = [ "fnod", "fnowallet", "fnoctl" ];
  let versions = {
    grpc: grpcVersions,
    fonero: app.getVersion()
  };

  for (let exe of exes) {
    let exePath = getExecutablePath("fnod", argv.customBinPath);
    if (!fs.existsSync(exePath)) {
      logger.log("error", "The fnod executable does not exist. Expected to find it at " + exePath);
    }

    let proc = spawn(exePath, args, { encoding: "utf8" });
    if (proc.error) {
      logger.log("error", `Error trying to read version of ${exe}: ${proc.error}`);
      continue;
    }

    let versionLine = proc.stdout.toString();
    if (!versionLine) {
      logger.log("error", `Empty version line when reading version of ${exe}`);
      continue;
    }

    let decodedLine = versionLine.match(/\w+ version ([^\s]+)/);
    if (decodedLine !== null) {
      versions[exe] = decodedLine[1];
    } else {
      logger.log("error", `Unable to decode version line ${versionLine}`);
    }
  }

  return versions;
};
