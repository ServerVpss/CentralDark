# COMANDO - MOBILE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\wry-0.55.1\MOBILE.md
**SHA:** 7e4311eb2128c660
**Timestamp:** 2026-08-28T02:37:42.587305
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 3. In a new terminal window, run:

### Ouro Bruto (primeiros 5000 chars)
```
# Mobile Setup for Wry

We use [cargo-mobile2](https://github.com/tauri-apps/cargo-mobile2) to create a mobile project for both Xcode and Android studio.

## Prerequisite

- Works on **Linux**, **Windows**, **macOS**, and **WSL**(Windows subsystem for Linux).
- **Xcode** and [**Android Studio**](https://developer.android.com/studio) installed properly. This is **the most difficult** part IMHO. This means all toolchains and SDK are all installed. Please report an issue with **comprehensive** steps if you encounter any problem.

## Setting up Android Environment

### 1. Installing JDK

#### Using Android Studio:

If you have Android Studio installed, it ships with a version of JDK so you don't have to install it manually. It is usually at `<path of android studio installation>/jre`. It will be used for `JAVA_HOME` env var.

> On macOS, it can be found at `/Applications/Android\ Studio.app/Contents/jbr/Contents/Home`
> On Windows, it can be found at `C:\Program Files\Android\Android Studio\jre`

#### Using the terminal:

##### Linux/WSL

- Install it by running the following command based on your distro to install JDK:

  - debian-based
    ```
    sudo apt install default-jdk
    ```
  - arch-based
    ```
    sudo pacman -S jdk-openjdk
    ```

- Set the `JAVA_HOME` env variable for this current shell (we will make it permanent later on)
  ```bash
  export JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
  ```

#### macOS

- Install openjdk from Homebrew:

```
brew install openjdk
```

- Link to system Java wrapper and set the `JAVA_HOME` env:

```
sudo ln -sfn /opt/homebrew/opt/openjdk/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk.jdk
export JAVA_HOME="/Library/Java/JavaVirtualMachines/openjdk.jdk/Contents/Home"
```

##### Windows

- Download openjdk-11
  ```powershell
  cd $HOME\downloads
  Invoke-WebRequest https://download.java.net/java/GA/jdk11/9/GPL/openjdk-11.0.2_windows-x64_bin.zip -o openjdk-11.zip
  Expand-Archive openjdk-11.zip -d .
  mkdir $env:LocalAppData\Java
  mv jdk-11.0.2 $env:LocalAppData\Java
  ```
- Set the `JAVA_HOME` env variable for this current shell (we will make it permanent later on)
  ```powershell
  $env:JAVA_HOME="$env:LocalAppData\Java\jdk-11.0.2"
  ```

### 2. Installing Android SDK and NDK

There are two ways to install the sdk and ndk.

#### Using Android Studio:

You can use the SDK Manager in Android Studio to install:

1. Android Sdk Platform 33
2. Android SDK Platform-Tools
3. NDK (Side by side) 25.0.8775105
4. Android SDK Build-Tools 33.0.
5. Android SDK Command-line Tools

> Note: you may need to tick `Show Package Details` in the right bottom corner to be able to see some of these components

#### Using the terminal:

If you don't want or can't use Android Studio you can still get the SDK Manager cli quite easily and use it to install other components.

> Note: The SDK Manager is part of the "Command line tools only" that can be downloaded from [here](https://developer.android.com/studio#command-tools)

##### Linux/WSL/macOS

Download the `cmdline-tools`

```bash
cd ~/Downloads

# if you are on Linux/WSL:
wget https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip -O
# if you are on macos:
wget https://dl.google.com/android/repository/commandlinetools-mac-8512546_latest.zip -O

unzip cmdline-tools.zip
cd cmdline-tools
mkdir latest
mv bin latest/
mv lib latest/
mv NOTICE.txt latest/
mv source.properties latest/
cd ..
mkdir ~/.android # You can use another location for your SDK but I prefer using ~/.android
mv cmdline-tools ~/.android
```

Install required SDK and NDK components

```bash
export ANDROID_HOME="$HOME/.android"
~/.android/cmdline-tools/latest/bin/sdkmanager "platforms;android-33" "platform-tools" "ndk;25.0.8775105" "build-tools;33.0.0"
# Install the emulator if you plan on using a virtual device later
~/.android/cmdline-tools/latest/bin/sdkmanager "emulator"
```

##### Windows

Download the `cmdline-tools`

```powershell
cd $HOME\downloads
Invoke-WebRequest https://dl.google.com/android/repository/commandlinetools-win-8512546_latest.zip -o cmdline-tools.zip
Expand-Archive cmdline-tools.zip -d .
cd cmdline-tools
mkdir latest
mv bin latest/
mv lib latest/
mv NOTICE.txt latest/
mv source.properties latest/
cd ..
mkdir $HOME\.android # You can use another location for your SDK but I prefer using $HOME\.android
mv cmdline-tools $HOME\.android
```

Install required SDK and NDK components

```powershell
$env:ANDROID_HOME="$HOME\.android"
&"$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.exe" "platforms;android-33" "platform-tools" "ndk;25.0.8775105" "build-tools;33.0.0"
# Install the emulator if you plan on using a virtual device later
&"$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.exe" "emulator"
```

> Note: the location you moved the `cmdline-tools` directory into will be the location of your android SDK.

### 3. Setting up Environment Variables

You'll need to set up some environment variables to get ev
```