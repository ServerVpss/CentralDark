# COMANDO - linux-reference.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\linux\references\linux-reference.md
**SHA:** a4f47b3050d1d0a6
**Timestamp:** 2026-08-26T18:42:53.303488
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- SDKError canStart = recordCtrl->CanStartRawRecording();
- if (canStart == SDKERR_SUCCESS) {

### Ouro Bruto (primeiros 5000 chars)
```
# Meeting SDK - Linux Reference

Complete reference for Zoom Meeting SDK on Linux including dependencies, Docker setup, and troubleshooting.

## System Requirements

- **OS**: Ubuntu 22+, CentOS 8/9, Oracle Linux 8
- **Architecture**: x86_64
- **Build Tools**: cmake 3.16+, gcc/g++ with C++11 support

## Dependencies

### Ubuntu 22/23

```bash
# Build essentials
apt-get update
apt-get install -y build-essential cmake

# X11/XCB libraries (required by SDK)
apt-get install -y --no-install-recommends --no-install-suggests \
    libx11-xcb1 \
    libxcb-xfixes0 \
    libxcb-shape0 \
    libxcb-shm0 \
    libxcb-randr0 \
    libxcb-image0 \
    libxcb-keysyms1 \
    libxcb-xtest0

# Optional but recommended
apt-get install -y --no-install-recommends --no-install-suggests \
    libdbus-1-3 \
    libglib2.0-0 \
    libgbm1 \
    libxfixes3 \
    libgl1 \
    libdrm2 \
    libgssapi-krb5-2

# For curl-based JWT fetching
apt-get install -y \
    libcurl4-openssl-dev \
    openssl \
    ca-certificates \
    pkg-config

# Audio support (PulseAudio)
apt-get install -y \
    libasound2 \
    libasound2-plugins \
    alsa \
    alsa-utils \
    alsa-oss \
    pulseaudio \
    pulseaudio-utils

# Optional: FFmpeg for video processing
apt-get install -y libavformat-dev libavfilter-dev libavdevice-dev ffmpeg

# If SDL2 errors occur
apt-get install -y libegl-mesa0 libsdl2-dev g++-multilib
```

### CentOS 8/9

```bash
# Build essentials
sudo yum install cmake gcc gcc-c++

# Enable required repos (CentOS 9)
sudo dnf config-manager --set-enabled crb
sudo dnf install epel-release epel-next-release

# XCB libraries
sudo yum install \
    libxcb-devel \
    xcb-util-devel \
    xcb-util-image \
    xcb-util-keysyms

# OpenGL/Mesa (for runtime)
sudo yum install \
    mesa-libGL \
    mesa-libGL-devel \
    mesa-dri-drivers

# Curl support
sudo yum install -y openssl-devel libcurl-devel

# PulseAudio
sudo yum install -y pulseaudio pulseaudio-utils

# Optional: FFmpeg
sudo yum install -y libavformat-dev libavfilter-dev libavdevice-dev ffmpeg

# If SDL2 errors occur
sudo yum install -y SDL2-devel
```

## CMakeLists.txt Template

```cmake
cmake_minimum_required(VERSION 3.16)

project(meetingSDKDemo CXX)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -g -O0")
add_definitions(-std=c++11)
set(CMAKE_BUILD_TYPE Debug)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)

find_package(PkgConfig REQUIRED)
find_package(ZLIB REQUIRED)

# GLib (required for main loop)
pkg_check_modules(GLIB REQUIRED glib-2.0)
pkg_check_modules(GIO REQUIRED gio-2.0)

# Include directories
include_directories(${CMAKE_SOURCE_DIR}/include)
include_directories(${CMAKE_SOURCE_DIR}/include/h)
include_directories(${GLIB_INCLUDE_DIRS} ${GIO_INCLUDE_DIRS})

# Common GLib paths
include_directories(/usr/include/glib-2.0/)
include_directories(/usr/include/glib-2.0/glib)
include_directories(/usr/lib/x86_64-linux-gnu/glib-2.0/include/)
include_directories(/usr/lib64/glib-2.0/include/)

# Link directories
link_directories(${GLIB_LIBRARY_DIRS} ${GIO_LIBRARY_DIRS})
link_directories(${CMAKE_SOURCE_DIR}/lib/zoom_meeting_sdk)
link_directories(${CMAKE_SOURCE_DIR}/lib/zoom_meeting_sdk/qt_libs)
link_directories(${CMAKE_SOURCE_DIR}/lib/zoom_meeting_sdk/qt_libs/Qt/lib)

add_definitions(${GLIB_CFLAGS_OTHER} ${GIO_CFLAGS_OTHER})

# Source files
add_executable(meetingSDKDemo
    ${CMAKE_SOURCE_DIR}/meeting_sdk_demo.cpp
    ${CMAKE_SOURCE_DIR}/AuthServiceEventListener.cpp
    ${CMAKE_SOURCE_DIR}/MeetingServiceEventListener.cpp
    ${CMAKE_SOURCE_DIR}/MeetingReminderEventListener.cpp
    ${CMAKE_SOURCE_DIR}/MeetingParticipantsCtrlEventListener.cpp
    ${CMAKE_SOURCE_DIR}/MeetingRecordingCtrlEventListener.cpp
    # Raw data handlers (if needed)
    ${CMAKE_SOURCE_DIR}/ZoomSDKRenderer.cpp
    ${CMAKE_SOURCE_DIR}/ZoomSDKAudioRawData.cpp
    ${CMAKE_SOURCE_DIR}/ZoomSDKVideoSource.cpp
    ${CMAKE_SOURCE_DIR}/ZoomSDKVirtualAudioMicEvent.cpp
)

# Link libraries
target_link_libraries(meetingSDKDemo ${GLIB_LIBRARIES} ${GIO_LIBRARIES})
target_link_libraries(meetingSDKDemo gcc_s gcc)
target_link_libraries(meetingSDKDemo meetingsdk)
target_link_libraries(meetingSDKDemo glib-2.0)
target_link_libraries(meetingSDKDemo curl)
target_link_libraries(meetingSDKDemo pthread)

# Create symlink for SDK
execute_process(COMMAND ln -sf libmeetingsdk.so libmeetingsdk.so.1
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}/lib/zoom_meeting_sdk
)

# Copy config to bin
configure_file(${CMAKE_SOURCE_DIR}/config.txt ${CMAKE_SOURCE_DIR}/bin/config.txt COPYONLY)

# Copy SDK files to bin
file(COPY ${CMAKE_SOURCE_DIR}/lib/zoom_meeting_sdk/ DESTINATION ${CMAKE_SOURCE_DIR}/bin)
```

## Configuration File

### config.txt Format

```
meeting_number: "1234567890"
token: "[REDIGIDO-PRESERVACAO]"
meeting_password: "abc123"
recording_token: ""
onBehalfOf_Token:
```