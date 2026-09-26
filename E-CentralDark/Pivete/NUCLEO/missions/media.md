# MISSAO - media.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\expo\skills\building-native-ui\references\media.md
**SHA:** b05966f4b2ab48b5
**Timestamp:** 2026-08-26T18:31:04.371283
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- <View style={{ position: "absolute", left: 0, right: 0, bottom: bottom, gap: 16, alignItems: "center" }}>

### Ouro Bruto (primeiros 5000 chars)
```
# Media

## Camera

- Hide navigation headers when there's a full screen camera
- Ensure to flip the camera with `mirror` to emulate social apps
- Use liquid glass buttons on cameras
- Icons: `arrow.triangle.2.circlepath` (flip), `photo` (gallery), `bolt` (flash)
- Eagerly request camera permission
- Lazily request media library permission

```tsx
import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import { PlatformColor } from "react-native";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Camera({ onPicture }: { onPicture: (uri: string) => Promise<void> }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [type, setType] = useState<CameraType>("back");
  const { bottom } = useSafeAreaInsets();

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: PlatformColor("systemBackground") }}>
        <Text style={{ color: PlatformColor("label"), padding: 16 }}>Camera access is required</Text>
        <GlassView isInteractive tintColor={PlatformColor("systemBlue")} style={{ borderRadius: 12 }}>
          <TouchableOpacity onPress={requestPermission} style={{ padding: 12, borderRadius: 12 }}>
            <Text style={{ color: "white" }}>Grant Permission</Text>
          </TouchableOpacity>
        </GlassView>
      </View>
    );
  }

  const takePhoto = async () => {
    await Haptics.selectionAsync();
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    await onPicture(photo.uri);
  };

  const selectPhoto = async () => {
    await Haptics.selectionAsync();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      await onPicture(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView ref={cameraRef} mirror style={{ flex: 1 }} facing={type} />
      <View style={{ position: "absolute", left: 0, right: 0, bottom: bottom, gap: 16, alignItems: "center" }}>
        <GlassView isInteractive style={{ padding: 8, borderRadius: 99 }}>
          <TouchableOpacity onPress={takePhoto} style={{ width: 64, height: 64, borderRadius: 99, backgroundColor: "white" }} />
        </GlassView>
        <View style={{ flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 8 }}>
          <GlassButton onPress={selectPhoto} icon="photo" />
          <GlassButton onPress={() => setType(t => t === "back" ? "front" : "back")} icon="arrow.triangle.2.circlepath" />
        </View>
      </View>
    </View>
  );
}
```

## Audio Playback

Use `expo-audio` not `expo-av`:

```tsx
import { useAudioPlayer } from 'expo-audio';

const player = useAudioPlayer({ uri: 'https://stream.nightride.fm/rektory.mp3' });

<Button title="Play" onPress={() => player.play()} />
```

## Audio Recording (Microphone)

```tsx
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect } from 'react';
import { Alert, Button } from 'react-native';

function App() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stop = () => audioRecorder.stop();

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (status.granted) {
        setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      } else {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  return (
    <Button
      title={recorderState.isRecording ? 'Stop' : 'Start'}
      onPress={recorderState.isRecording ? stop : record}
    />
  );
}
```

## Video Playback

Use `expo-video` not `expo-av`:

```tsx
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

const videoSource = 'https://example.com/video.mp4';

const player = useVideoPlayer(videoSource, player => {
  player.loop = true;
  player.play();
});

const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

<VideoView player={player} fullscreenOptions={{}} allowsPictureInPicture />
```

VideoView options:
- `allowsPictureInPicture`: 
```