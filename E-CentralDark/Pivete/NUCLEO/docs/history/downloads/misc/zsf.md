# OUTRO - zsf.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\zod@4.4.3@@@1\src\v4\core\zsf.ts
**SHA:** 975e61b52c8de9fa
**Timestamp:** 2026-08-28T02:28:44.416421
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- //   pattern: string;

### Ouro Bruto (primeiros 5000 chars)
```
///////////////////////////////////////////////////
////////////////      TYPES     ///////////////////
///////////////////////////////////////////////////

export interface $ZSF {
  $zsf: { version: number };
  type: string;
  // default value if not defined
  default: unknown;
  // fallback value if validation fails
  fallback: unknown;
}

export interface $ZSFString extends $ZSF {
  type: "string";
  min_length?: number;
  max_length?: number;
  pattern?: string;
}

export type NumberTypes = "float32" | "int32" | "uint32" | "float64" | "int64" | "uint64" | "bigint" | "bigdecimal";

export interface $ZSFNumber extends $ZSF {
  type: "number";
  format?: NumberTypes;
  minimum?: number;
  maximum?: number;
  multiple_of?: number;
}

export interface $ZSFBoolean extends $ZSF {
  type: "boolean";
}

export interface $ZSFNull extends $ZSF {
  type: "null";
}

export interface $ZSFUndefined extends $ZSF {
  type: "undefined";
}

export interface $ZSFOptional<T extends $ZSF = $ZSF> extends $ZSF {
  type: "optional";
  inner: T;
}

export interface $ZSFNever extends $ZSF {
  type: "never";
}

export interface $ZSFAny extends $ZSF {
  type: "any";
}

/** Supports */
export interface $ZSFEnum<Elements extends { [k: string]: $ZSFLiteral } = { [k: string]: $ZSFLiteral }> extends $ZSF {
  type: "enum";
  elements: Elements;
}

export interface $ZSFArray<PrefixItems extends $ZSF[] = $ZSF[], Items extends $ZSF = $ZSF> extends $ZSF {
  type: "array";
  prefixItems: PrefixItems;
  items: Items;
}

// type $ZSFObjectProperties = { [k: string]: $ZSF };
type $ZSFObjectProperties = Array<{
  key: string;
  value: $ZSF;
  format?: "literal" | "pattern";
  ordering?: number;
}>;
export interface $ZSFObject<Properties extends $ZSFObjectProperties = $ZSFObjectProperties> extends $ZSF {
  type: "object";
  properties: Properties;
}

// export interface $ZSFTuple<
//   Items extends $ZSF[] = $ZSF[],
//   Rest extends $ZSF = $ZSF,
// > extends $ZSF {
//   type: "array";
//   items: Items;
//   rest: Rest;
// }

/** Supports arbitrary literal values */
export interface $ZSFLiteral<T extends $ZSF = $ZSF> extends $ZSF {
  type: "literal";
  schema: T;
  value: unknown;
}

export interface $ZSFUnion<Elements extends $ZSF[] = $ZSF[]> extends $ZSF {
  type: "union";
  elements: Elements;
}

export interface $ZSFIntersection extends $ZSF {
  type: "intersection";
  elements: $ZSF[];
}

export interface $ZSFMap<K extends $ZSF = $ZSF, V extends $ZSF = $ZSF> extends $ZSF {
  type: "map";
  keys: K;
  values: V;
}

export interface $ZSFConditional<If extends $ZSF, Then extends $ZSF, Else extends $ZSF> extends $ZSF {
  type: "conditional";
  if: If;
  then: Then;
  else: Else;
}

/////////////////////////////////////////////////
////////////////      CHECKS     ////////////////
/////////////////////////////////////////////////

// export interface $ZSFCheckRegex {
//   check: "regex";
//   pattern: string;
// }

// export interface $ZSFCheckEmail {
//   check: "email";
// }

// export interface $ZSFCheckURL {
//   check: "url";
// }

// export interface $ZSFCheckEmoji {
//   check: "emoji";
// }

// export interface $ZSFCheckUUID {
//   check: "uuid";
// }

// export interface $ZSFCheckUUIDv4 {
//   check: "uuidv4";
// }

// export interface $ZSFCheckUUIDv6 {
//   check: "uuidv6";
// }

// export interface $ZSFCheckNanoid {
//   check: "nanoid";
// }

// export interface $ZSFCheckGUID {
//   check: "guid";
// }

// export interface $ZSFCheckCUID {
//   check: "cuid";
// }

// export interface $ZSFCheckCUID2 {
//   check: "cuid2";
// }

// export interface $ZSFCheckULID {
//   check: "ulid";
// }

// export interface $ZSFCheckXID {
//   check: "xid";
// }

// export interface $ZSFCheckKSUID {
//   check: "ksuid";
// }

// export interface $ZSFCheckISODateTime {
//   check: "datetime";
//   precision?: number;
//   local?: boolean;
// }

// export interface $ZSFCheckISODate {
//   check: "date";
// }

// export interface $ZSFCheckISOTime {
//   check: "time";
//   precision?: number;
//   local?: boolean;
// }

// export interface $ZSFCheckDuration {
//   check: "duration";
// }

// export interface $ZSFCheckIP {
//   check: "ip";
// }

// export interface $ZSFCheckIPv4 {
//   check: "ipv4";
// }

// export interface $ZSFCheckIPv6 {
//   check: "ipv6";
// }

// export interface $ZSFCheckBase64 {
//   check: "base64";
// }

// export interface $ZSFCheckJWT {
//   check: "jwt";
// }

// export interface $ZSFCheckJSONString {
//   check: "json_string";
// }

// export interface $ZSFCheckPrefix {
//   check: "prefix";
//   prefix: string;
// }

// export interface $ZSFCheckSuffix {
//   check: "suffix";
//   suffix: string;
// }

// export interface $ZSFCheckIncludes {
//   check: "includes";
//   includes: string;
// }

// export interface $ZSFCheckMinSize {
//   check: "min_size";
//   minimum: number;
// }

// export interface $ZSFCheckMaxSize {
//   check: "max_size";
//   maximum: number;
// }

// export interface $ZSFCheckSizeEquals {
//   che
```