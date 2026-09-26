# OUTRO - ipv4.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\ip-address\dist\ipv4.d.ts
**SHA:** c4f7e7a6361705a6
**Timestamp:** 2026-08-26T19:32:16.514075
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- getBitsBase2(start: number, end: number): string;

### Ouro Bruto (primeiros 5000 chars)
```
import * as common from './common';
/**
 * Represents an IPv4 address
 * @param {string} address - An IPv4 address string
 */
export declare class Address4 {
    address: string;
    addressMinusSuffix?: string;
    groups: number;
    parsedAddress: string[];
    parsedSubnet: string;
    subnet: string;
    subnetMask: number;
    v4: boolean;
    private _binaryZeroPad?;
    constructor(address: string);
    /**
     * Returns true if the given string is a valid IPv4 address (with optional
     * CIDR subnet), false otherwise. Host bits in the subnet portion are
     * allowed (e.g. `192.168.1.5/24` is valid); for strict network-address
     * validation compare `correctForm()` to `startAddress().correctForm()`,
     * or use `networkForm()`.
     */
    static isValid(address: string): boolean;
    /**
     * Parses an IPv4 address string into its four octet groups and stores the
     * result on `this.parsedAddress`. Called automatically by the constructor;
     * you typically don't need to call it directly. Throws `AddressError` if
     * the input is not a valid IPv4 address.
     */
    parse(address: string): string[];
    /**
     * Returns the address in correct form: octets joined with `.` and any
     * leading zeros stripped (e.g. `192.168.1.1`). For IPv4 this matches the
     * canonical dotted-decimal representation.
     */
    correctForm(): string;
    /**
     * Returns true if the address is correct, false otherwise
     * @returns {Boolean}
     */
    isCorrect: (this: Address4 | import("./ipv6").Address6) => boolean;
    /**
     * Construct an `Address4` from an address and a dotted-decimal subnet
     * mask given as separate strings (e.g. as returned by Node's
     * `os.networkInterfaces()`). Throws `AddressError` if the mask is
     * non-contiguous (e.g. `255.0.255.0`).
     * @example
     * var address = Address4.fromAddressAndMask('192.168.1.1', '255.255.255.0');
     * address.subnetMask; // 24
     */
    static fromAddressAndMask(address: string, mask: string): Address4;
    /**
     * Construct an `Address4` from an address and a Cisco-style wildcard mask
     * given as separate strings (e.g. `0.0.0.255` for a `/24`). The wildcard
     * mask is the bitwise inverse of the subnet mask. Throws `AddressError`
     * if the mask is non-contiguous (e.g. `0.255.0.255`).
     * @example
     * var address = Address4.fromAddressAndWildcardMask('10.0.0.1', '0.0.0.255');
     * address.subnetMask; // 24
     */
    static fromAddressAndWildcardMask(address: string, wildcardMask: string): Address4;
    /**
     * Construct an `Address4` from a wildcard pattern with trailing `*`
     * octets. The number of trailing wildcards determines the prefix
     * length: each `*` represents 8 bits.
     *
     * Only trailing whole-octet wildcards are supported. Partial-octet
     * wildcards (e.g. `192.168.0.1*`) and interior wildcards (e.g.
     * `192.*.0.1`) throw `AddressError`.
     * @example
     * Address4.fromWildcard('192.168.0.*').subnet;   // '/24'
     * Address4.fromWildcard('192.168.*.*').subnet;   // '/16'
     * Address4.fromWildcard('*.*.*.*').subnet;       // '/0'
     */
    static fromWildcard(input: string): Address4;
    /**
     * Converts a hex string to an IPv4 address object. Accepts 8 hex digits
     * with optional `:` separators (e.g. `'7f000001'` or `'7f:00:00:01'`).
     * Throws `AddressError` for any other length or for non-hex characters.
     * @param {string} hex - a hex string to convert
     * @returns {Address4}
     */
    static fromHex(hex: string): Address4;
    /**
     * Converts an integer into a IPv4 address object. The integer must be a
     * non-negative safe integer in the range `[0, 2**32 - 1]`; otherwise
     * `AddressError` is thrown.
     * @param {integer} integer - a number to convert
     * @returns {Address4}
     */
    static fromInteger(integer: number): Address4;
    /**
     * Return an address from in-addr.arpa form
     * @param {string} arpaFormAddress - an 'in-addr.arpa' form ipv4 address
     * @returns {Adress4}
     * @example
     * var address = Address4.fromArpa(42.2.0.192.in-addr.arpa.)
     * address.correctForm(); // '192.0.2.42'
     */
    static fromArpa(arpaFormAddress: string): Address4;
    /**
     * Converts an IPv4 address object to a hex string
     * @returns {String}
     */
    toHex(): string;
    /**
     * Converts an IPv4 address object to an array of bytes.
     *
     * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toArray())`.
     * @returns {Array}
     */
    toArray(): number[];
    /**
     * Converts an IPv4 address object to an IPv6 address group
     * @returns {String}
     */
    toGroup6(): string;
    /**
     * Returns the address as a `bigint`
     * @returns {bigint}
     */
    bigInt(): bigint;
    /**
     * Helper function getting start address.
     * @returns {bigint}
     */
    _startAddress(): bigint;
    /**
     * The first address in the range gi
```

---

# OUTRO - ipv4.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\format\ipv4.d.mts
**SHA:** bac39438cce543e0
**Timestamp:** 2026-08-28T02:25:15.843060
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- export declare function IsIPv4Internal(value: string, start: number, end: number): boolean;

### Ouro Bruto (primeiros 5000 chars)
```
export declare function IsIPv4Internal(value: string, start: number, end: number): boolean;
/**
 * Returns true if the value is a IPV4 address
 * @specification http://tools.ietf.org/html/rfc2673#section-3.2
 */
export declare function IsIPv4(value: string): boolean;

```