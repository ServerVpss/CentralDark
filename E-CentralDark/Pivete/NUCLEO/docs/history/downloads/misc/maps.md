# OUTRO - maps.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\remotion\skills\remotion\rules\maps.md
**SHA:** 5a531e1c925c58c4
**Timestamp:** 2026-08-26T18:42:42.490023
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = lineCoordinates[0];

### Ouro Bruto (primeiros 5000 chars)
```
---
name: maps
description: Make map animations with Mapbox
metadata:
  tags: map, map animation, mapbox
---

Maps can be added to a Remotion video with Mapbox.  
The [Mapbox documentation](https://docs.mapbox.com/mapbox-gl-js/api/) has the API reference.

## Prerequisites

Mapbox and `@turf/turf` need to be installed.

Search the project for lockfiles and run the correct command depending on the package manager:

If `package-lock.json` is found, use the following command:

```bash
npm i mapbox-gl @turf/turf @types/mapbox-gl
```

If `bun.lock` is found, use the following command:

```bash
bun i mapbox-gl @turf/turf @types/mapbox-gl
```

If `yarn.lock` is found, use the following command:

```bash
yarn add mapbox-gl @turf/turf @types/mapbox-gl
```

If `pnpm-lock.yaml` is found, use the following command:

```bash
pnpm i mapbox-gl @turf/turf @types/mapbox-gl
```

The user needs to create a free Mapbox account and create an access token by visiting https://console.mapbox.com/account/access-tokens/.

The mapbox token needs to be added to the `.env` file:

```txt title=".env"
REMOTION_MAPBOX_TOKEN=[REDIGIDO-PRESERVACAO]
```

## Adding a map

Here is a basic example of a map in Remotion.

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill, useDelayRender, useVideoConfig } from "remotion";
import mapboxgl, { Map } from "mapbox-gl";

export const lineCoordinates = [
  [6.56158447265625, 46.059891147620725],
  [6.5691375732421875, 46.05679376154153],
  [6.5842437744140625, 46.05059898938315],
  [6.594886779785156, 46.04702502069337],
  [6.601066589355469, 46.0460718554722],
  [6.6089630126953125, 46.0365370783104],
  [6.6185760498046875, 46.018420689207964],
];

mapboxgl.accessToken = process.env.REMOTION_MAPBOX_TOKEN as string;

export const MyComposition = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { delayRender, continueRender } = useDelayRender();

  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender("Loading map..."));
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    const _map = new Map({
      container: ref.current!,
      zoom: 11.53,
      center: [6.5615, 46.0598],
      pitch: 65,
      bearing: 0,
      style: "⁠mapbox://styles/mapbox/standard",
      interactive: false,
      fadeDuration: 0,
    });

    _map.on("style.load", () => {
      // Hide all features from the Mapbox Standard style
      const hideFeatures = [
        "showRoadsAndTransit",
        "showRoads",
        "showTransit",
        "showPedestrianRoads",
        "showRoadLabels",
        "showTransitLabels",
        "showPlaceLabels",
        "showPointOfInterestLabels",
        "showPointsOfInterest",
        "showAdminBoundaries",
        "showLandmarkIcons",
        "showLandmarkIconLabels",
        "show3dObjects",
        "show3dBuildings",
        "show3dTrees",
        "show3dLandmarks",
        "show3dFacades",
      ];
      for (const feature of hideFeatures) {
        _map.setConfigProperty("basemap", feature, false);
      }

      _map.setConfigProperty("basemap", "colorTrunks", "rgba(0, 0, 0, 0)");

      _map.addSource("trace", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: lineCoordinates,
          },
        },
      });
      _map.addLayer({
        type: "line",
        source: "trace",
        id: "line",
        paint: {
          "line-color": "black",
          "line-width": 5,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });
    });

    _map.on("load", () => {
      continueRender(handle);
      setMap(_map);
    });
  }, [handle, lineCoordinates]);

  const style: React.CSSProperties = useMemo(
    () => ({ width, height, position: "absolute" }),
    [width, height],
  );

  return <AbsoluteFill ref={ref} style={style} />;
};
```

The following is important in Remotion:

- Animations must be driven by `useCurrentFrame()` and animations that Mapbox brings itself should be disabled. For example, the `fadeDuration` prop should be set to `0`, `interactive` should be set to `false`, etc.
- Loading the map should be delayed using `useDelayRender()` and the map should be set to `null` until it is loaded.
- The element containing the ref MUST have an explicit width and height and `position: "absolute"`.
- Do not add a `_map.remove();` cleanup function.

## Drawing lines

Unless I request it, do not add a glow effect to the lines.
Unless I request it, do not add additional points to the lines.

## Map style

By default, use the `mapbox://styles/mapbox/standard` style.  
Hide the labels from the base map style.

Unless I request otherwise, remove all features from the Mapbox Standard style.

```tsx
// Hide all features from the Mapbox Standard style
const hideFeatures = [
  "showRoadsAndTransit",
  "
```

---

# OUTRO - maps.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-1.2.2\src\json_schema_impls\maps.rs
**SHA:** 9946bbd24cfa6f05
**Timestamp:** 2026-08-28T02:35:17.876495
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let key_pattern = option.get("pattern").and_then(Value::as_str);

### Ouro Bruto (primeiros 5000 chars)
```
use crate::_alloc_prelude::*;
use crate::{json_schema, JsonSchema, Schema, SchemaGenerator};
use alloc::borrow::Cow;
use alloc::collections::{BTreeMap, BTreeSet};
use serde_json::{Map, Value};

#[derive(Ord, PartialOrd, Eq, PartialEq, Copy, Clone)]
enum IntegerSupport {
    None,
    Unsigned,
    Signed,
}

impl<K, V> JsonSchema for BTreeMap<K, V>
where
    K: JsonSchema,
    V: JsonSchema,
{
    inline_schema!();

    fn schema_name() -> Cow<'static, str> {
        Cow::Owned(if K::schema_id() == <str>::schema_id() {
            format!("Map_of_{}", V::schema_name())
        } else {
            format!("Map_from_{}_to_{}", K::schema_name(), V::schema_name())
        })
    }

    fn schema_id() -> Cow<'static, str> {
        Cow::Owned(if K::schema_id() == <str>::schema_id() {
            format!("Map<{}>", V::schema_id())
        } else {
            format!("Map<{}, {}>", K::schema_id(), V::schema_id())
        })
    }

    fn json_schema(generator: &mut SchemaGenerator) -> Schema {
        let key_schema = K::json_schema(generator);
        let value_schema = generator.subschema_for::<V>();

        let mut map_schema = json_schema!({
            "type": "object",
        });

        let Some(mut options) = key_schema
            .get("anyOf")
            .and_then(Value::as_array)
            .and_then(|a| a.iter().map(Value::as_object).collect::<Option<Vec<_>>>())
            .or_else(|| Some(vec![key_schema.as_object()?]))
        else {
            return json_schema!({
                "additionalProperties": value_schema,
                "type": "object",
            });
        };

        // Handle refs
        let prefix = format!("#{}/", generator.definitions_path_stripped());
        for option in &mut options {
            if let Some(d) = option
                .get("$ref")
                .and_then(Value::as_str)
                .and_then(|r| r.strip_prefix(&prefix))
                .and_then(|r| generator.definitions().get(r))
                .and_then(Value::as_object)
            {
                *option = d;
            }
        }

        let mut additional_properties = false;
        let mut support_integers = IntegerSupport::None;
        let mut patterns = BTreeSet::new();
        let mut properties = BTreeSet::new();
        for option in options {
            let key_pattern = option.get("pattern").and_then(Value::as_str);
            let key_enum = option
                .get("enum")
                .and_then(Value::as_array)
                .and_then(|a| a.iter().map(Value::as_str).collect::<Option<Vec<_>>>());
            let key_type = option.get("type").and_then(Value::as_str);
            let key_minimum = option.get("minimum").and_then(Value::as_u64);

            match (key_pattern, key_enum, key_type) {
                (Some(pattern), _, Some("string")) => {
                    patterns.insert(pattern);
                }
                (None, Some(enum_values), Some("string")) => {
                    for value in enum_values {
                        properties.insert(value);
                    }
                }
                (_, _, Some("integer")) if key_minimum == Some(0) => {
                    support_integers = support_integers.max(IntegerSupport::Unsigned);
                }
                (_, _, Some("integer")) => {
                    support_integers = support_integers.max(IntegerSupport::Signed);
                }
                _ => {
                    additional_properties = true;
                }
            }
        }

        if additional_properties {
            map_schema.insert(
                "additionalProperties".to_owned(),
                value_schema.clone().to_value(),
            );
        } else {
            map_schema.insert("additionalProperties".to_owned(), Value::Bool(false));
        }

        match support_integers {
            IntegerSupport::None => {}
            IntegerSupport::Unsigned => {
                patterns.insert(r"^\d+$");
            }
            IntegerSupport::Signed => {
                patterns.insert(r"^-?\d+$");
            }
        }

        if !patterns.is_empty() {
            let mut patterns_map = Map::new();

            for pattern in patterns {
                patterns_map.insert(pattern.to_owned(), value_schema.clone().to_value());
            }

            map_schema.insert("patternProperties".to_owned(), Value::Object(patterns_map));
        }

        if !properties.is_empty() {
            let mut properties_map = Map::new();

            for property in properties {
                properties_map.insert(property.to_owned(), value_schema.clone().to_value());
            }

            map_schema.insert("properties".to_owned(), Value::Object(properties_map));
        }

        map_schema
    }
}

#[cfg(feature = "std")]
forward_impl!((<K: JsonSchema, V: JsonSchema, H> JsonSchema for std::collections::HashMap<K, V, H>) => BTreeMap<K, V>);

```