# MISSAO - windows-reference.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\zoom\skills\meeting-sdk\windows\references\windows-reference.md
**SHA:** 860601654bc4f6ef
**Timestamp:** 2026-08-26T18:42:44.021611
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- case Recording_Start:
- SDKError canStart = recordCtrl->CanStartRecording(false, 0);
- if (canStart == SDKERR_SUCCESS) {

### Ouro Bruto (primeiros 5000 chars)
```
# Meeting SDK - Windows Reference

Complete reference for Zoom Meeting SDK on Windows including dependencies, Visual Studio setup, and troubleshooting.

## System Requirements

- **OS**: Windows 10 or later, Windows Server 2016+
- **Architecture**: x86 (32-bit) and x64 (64-bit)
- **IDE**: Visual Studio 2019, 2022, or later
- **C++ Standard**: C++11 or later

## Dependencies

### Required Tools

```powershell
# Install vcpkg (package manager for C++)
git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg
cd C:\vcpkg
.\bootstrap-vcpkg.bat
.\vcpkg integrate install
```

### Required Libraries

```powershell
# For x64
.\vcpkg install jsoncpp:x64-windows
.\vcpkg install curl:x64-windows

# For x86
.\vcpkg install jsoncpp:x86-windows
.\vcpkg install curl:x86-windows

# Set default triplet (optional)
$env:VCPKG_DEFAULT_TRIPLET = "x64-windows"
```

### Visual Studio Workloads

Required workloads in Visual Studio Installer:
- Desktop development with C++
- Windows 10/11 SDK
- C++ CMake tools (optional, for CMake projects)

## Visual Studio Project Configuration

### Project Properties Template

Create a new C++ Console Application, then configure:

#### C/C++ Settings

**General → Additional Include Directories:**
```
$(SolutionDir)SDK\$(PlatformTarget)\h
$(SolutionDir)SDK\$(PlatformTarget)\h\meeting_service_components
$(SolutionDir)SDK\$(PlatformTarget)\h\rawdata
C:\vcpkg\packages\jsoncpp_$(PlatformTarget)-windows\include
C:\vcpkg\packages\curl_$(PlatformTarget)-windows\include
```

**Preprocessor → Preprocessor Definitions:**
```
WIN32
_DEBUG (for Debug config)
_CONSOLE
_UNICODE
UNICODE
%(PreprocessorDefinitions)
```

**Code Generation → Runtime Library:**
- Debug: Multi-threaded Debug DLL (/MDd)
- Release: Multi-threaded DLL (/MD)

#### Linker Settings

**General → Additional Library Directories:**
```
$(SolutionDir)SDK\$(PlatformTarget)\lib
C:\vcpkg\packages\jsoncpp_$(PlatformTarget)-windows\lib
C:\vcpkg\packages\curl_$(PlatformTarget)-windows\lib
```

**Input → Additional Dependencies:**
```
sdk.lib
ws2_32.lib
%(AdditionalDependencies)
```

#### Build Events

**Post-Build Event → Command Line:**
```cmd
xcopy /Y /D "$(SolutionDir)SDK\$(PlatformTarget)\bin\*.*" "$(OutDir)"
xcopy /Y /D "$(ProjectDir)config.json" "$(OutDir)"
```

This copies all SDK DLLs and config.json to your output directory.

### CMakeLists.txt Template (Alternative)

```cmake
cmake_minimum_required(VERSION 3.16)

project(ZoomMeetingSDK CXX)
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set output directories
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/bin)

# Find vcpkg packages
find_package(jsoncpp CONFIG REQUIRED)
find_package(CURL REQUIRED)

# Include directories
include_directories(
    ${CMAKE_SOURCE_DIR}/SDK/x64/h
    ${CMAKE_SOURCE_DIR}/SDK/x64/h/meeting_service_components
    ${CMAKE_SOURCE_DIR}/SDK/x64/h/rawdata
)

# Link directories
link_directories(
    ${CMAKE_SOURCE_DIR}/SDK/x64/lib
    ${CMAKE_SOURCE_DIR}/SDK/x64/bin
)

# Source files
add_executable(YourApp
    YourApp.cpp
    AuthServiceEventListener.cpp
    MeetingServiceEventListener.cpp
    NetworkConnectionHandler.cpp
    WebService.cpp
    # Add more source files as needed
)

# Link libraries
target_link_libraries(YourApp
    sdk.lib
    JsonCpp::JsonCpp
    CURL::libcurl
)

# Copy DLLs to output directory
add_custom_command(TARGET YourApp POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    "${CMAKE_SOURCE_DIR}/SDK/x64/bin"
    $<TARGET_FILE_DIR:YourApp>
)

# Copy config.json
configure_file(
    ${CMAKE_SOURCE_DIR}/config.json
    ${CMAKE_SOURCE_DIR}/bin/config.json
    COPYONLY
)
```

## Configuration File

### config.json Format

```json
{
  "sdk_jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "meeting_number": "1234567890",
  "passcode": "abc123",
  "video_source": "Big_Buck_Bunny_720_10s_1MB.mp4",
  "zak": ""
}
```

### Reading Config in Code

```cpp
#include <fstream>
#include <json/json.h>

void LoadConfig() {
    std::ifstream f("config.json");
    Json::Value config;

    if (f.is_open()) {
        try {
            f >> config;

            // Extract values
            std::string jwt = config["sdk_jwt"].asString();
            std::string meetingNum = config["meeting_number"].asString();
            std::string passcode = config["passcode"].asString();

            // Convert to wstring for SDK
            sdk_jwt = std::wstring(jwt.begin(), jwt.end());
            meeting_number = std::stoull(meetingNum);
            // ...
        } catch (const std::exception& e) {
            std::cerr << "Error parsing config.json: " << e.what() << std::endl;
        }
    } else {
        std::cerr << "config.json not found" << std::endl;
    }
}
```

## Event Listeners

### Complete Event Listener Templates

#### AuthServiceEventListener.cpp

```cpp
#include "AuthServiceEventListener.h"
#include <iostream>

A
```