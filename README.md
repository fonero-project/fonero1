# fonero

[![ISC License](http://img.shields.io/badge/license-ISC-blue.svg)](http://copyfree.org)

Fonero based on React, React Router, Webpack, React Hot Loader for rapid application development.

## Installation

Currently fonero is available on Windows, Linux, and macOS.

Fonero will NOT use or in any way disrupt the CLI wallet file you may
already be using at this time.

Download the fonero release for your operating system on [fonero/fonero-binaries](https://github.com/fonero-project/fonero-binaries/releases).

On macOS, Ubuntu (14.04 LTS kernel 3.16 and later), and recent Debians, there should be
no additional dependencies needed (exception: Ubuntu 18.04+, see [issue #1404](https://github.com/decred/decrediton/issues/1404)).

On Fedora or similar distros you may need to install the libXScrnSaver
package if you see this error:
```
error while loading shared libraries: libXss.so.1
```

You can install this on a recent Fedora with the command:

```bash
sudo dnf -y install libXScrnSaver
```

On linux you will need to decompress the package:
```bash
tar -xvzf fonero-X.X.X.tar.gz
```
and then run the file:
```bash
./fonero
```

This will start fnod and fnowallet for you.

On macOS, double-click the .dmg file, drag the .app to your
Applications folder.  Double click on Fonero.app to start.

You can also install via [brew cask](https://caskroom.github.io):
```bash
brew cask install fonero
```

From there follow the on screen instructions to setup your wallet.

### Options

When running a release version, there are a few options available.

To see additional debug information (including the output of fnod and fnowallet) run:

```
fonero --debug
```

To pass additional arguments to fnowallet (such as to increase the logging level run:

```
fonero --extrawalletargs='-d=debug'
```

## Developing

Due to potential compatibility issues, for now, all work should be
done with electron 2.0.0.

You need to install fnod, fnowallet and fnoctl.

- [fnod/fnoctl installation instructions](https://github.com/fonero-project/fnod#updating)
- [fnowallet installation instructions](https://github.com/fonero-project/fnowallet#installation-and-updating)

This has been tested on Linux and OSX.

Adjust the following steps for the paths you want to use.

``` bash
mkdir code
cd code
git clone https://github.com/fonero-project/fonero.git
cd fonero
yarn
mkdir bin/
cp $GOPATH/bin/fno* bin/
yarn dev
```

## Setting up your development environment
The following steps will help you configure your fonero development environment and reduce future startup times.

### Wallet
When you launch fonero, you will be prompted to select a wallet to use. Select your wallet or create a new one using the in-app wizard. Be sure to save your seed and make your password memorable.

### Fonero Node
It will be helpful to you to run the Fonero node in a separate process and simply attach to it between fonero restarts. In order to see the advanced daemon configuration options you open your ```config.json``` and set the ```daemon_start_advanced``` flag to ```true``` as follows:

```"daemon_start_advanced": true,```

Note: Your config.json file is located in the following directory(s)

Windows - ```C:\Users\<your-username>\AppData\Local\Fonero\config.json```

OSX - ```$HOME/Library/Application\ Support/Fonero/config.json```

Linux - ```~/.config/fonero/config.json```

Run the following to start the Fonero daemon in a standalone terminal window:

Windows - ```fnod --testnet -u USER -P PASSWORD --rpclisten=127.0.0.1:19119 --rpccert=C:\Users\<username>\AppData\Local\Fnod\rpc.cert```

OSX - ```fnod --testnet -u USER -P PASSWORD --rpclisten=127.0.0.1:19119 --rpccert=$HOME/Library/Application\ Support/Fnod/rpc.cert```

Linux - ```fnod --testnet -u USER -P PASSWORD --rpclisten=127.0.0.1:19119 --rpccert=~/.fnod/rpc.cert```

You can connect to this daemon in ```Advanced Startup => Different Local Daemon Location``` and input the parameters requested. Note that all the parameters needed are present in the command you used to start the node for your respective system.

### Windows

On windows you will need some extra steps to build grpc.  This assumes
you are using msys2 with various development tools (compilers, make,
etc) all installed.

Install node from the official package https://nodejs.org/en/download/
and add it to your msys2 path.  You must install the same version of node as required for Linux and OSX (8.6.0+).

Install openssl from the following site:
https://slproweb.com/products/Win32OpenSSL.html

From an admin shell:

```bash
npm install --global --production windows-build-tools
```

Then build grpc as described above.

## Building the package

You need to install fnod, fnowallet and fnoctl.

- [fnod/fnoctl installation instructions](https://github.com/fonero-project/fnod#updating)
- [fnowallet installation instructions](https://github.com/fonero-project/fnowallet#installation-and-updating)

To build a packaged version of fonero (including a dmg on OSX and
exe on Windows), follow the development steps above.  Then build the
fno command line tools:

```bash
cd code/fonero
mkdir bin
cp `which fnod` bin/
cp `which fnoctl` bin/
cp `which fnowallet` bin/
yarn
yarn package
```

## Building release versions

### Linux

You need to make sure you have the following packages installed for the building to work:
- icns2png
- graphicsmagick
- rpm-build

```bash
yarn package-linux
```

After it is finished it will have the built rpm, deb and tar.gz in the releases/ directory.

If you're only interested in a tar.gz, you can alternatively use:

```bash
yarn package-dev-linux
```

## Contact

If you have any further questions you can find us at:

- irc.freenode.net (channel #fonero)
- [webchat](https://webchat.freenode.net/?channels=fonero)
- forum.fonero.org
- fonero.slack.com

## Issue Tracker

The
[integrated github issue tracker](https://github.com/fonero-project/fonero/issues)
is used for this project.

## License

fonero is licensed under the [copyfree](http://copyfree.org) ISC License.
