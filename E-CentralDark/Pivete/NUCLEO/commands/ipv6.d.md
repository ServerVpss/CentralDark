# COMANDO - ipv6.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\ip-address\dist\ipv6.d.ts
**SHA:** 9477b70b5adc86d2
**Timestamp:** 2026-08-26T19:32:16.562120
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- getBits(start: number, end: number): bigint;
- getBitsBase2(start: number, end: number): string;
- getBitsBase16(start: number, end: number): string;

### Ouro Bruto (primeiros 5000 chars)
```
import * as common from './common';
import { Address4 } from './ipv4';
interface SixToFourProperties {
    prefix: string;
    gateway: string;
}
interface TeredoProperties {
    prefix: string;
    server4: string;
    client4: string;
    flags: string;
    coneNat: boolean;
    microsoft: {
        reserved: boolean;
        universalLocal: boolean;
        groupIndividual: boolean;
        nonce: string;
    };
    udpPort: string;
}
/**
 * Represents an IPv6 address
 * @param {string} address - An IPv6 address string
 * @param {number} [groups=8] - How many octets to parse
 * @example
 * var address = new Address6('2001::/32');
 */
export declare class Address6 {
    address4?: Address4;
    address: string;
    addressMinusSuffix: string;
    elidedGroups?: number;
    elisionBegin?: number;
    elisionEnd?: number;
    groups: number;
    parsedAddress4?: string;
    parsedAddress: string[];
    parsedSubnet: string;
    subnet: string;
    subnetMask: number;
    v4: boolean;
    zone: string;
    private _binaryZeroPad?;
    constructor(address: string, optionalGroups?: number);
    /**
     * Returns true if the given string is a valid IPv6 address (with optional
     * CIDR subnet and zone identifier), false otherwise. Host bits in the
     * subnet portion are allowed (e.g. `2001:db8::1/32` is valid); for strict
     * network-address validation compare `correctForm()` to
     * `startAddress().correctForm()`, or use `networkForm()`.
     */
    static isValid(address: string): boolean;
    /**
     * Convert a BigInt to a v6 address object. The value must be in the
     * range `[0, 2**128 - 1]`; otherwise `AddressError` is thrown.
     * @param {bigint} bigInt - a BigInt to convert
     * @returns {Address6}
     * @example
     * var bigInt = BigInt('1000000000000');
     * var address = Address6.fromBigInt(bigInt);
     * address.correctForm(); // '::e8:d4a5:1000'
     */
    static fromBigInt(bigInt: bigint): Address6;
    /**
     * Parse a URL (with optional bracketed host and port) into an address and
     * port. Returns either `{ address, port }` on success or
     * `{ error, address: null, port: null }` if the URL could not be parsed.
     * Ports are returned as numbers (or `null` if absent or out of range).
     * @example
     * var addressAndPort = Address6.fromURL('http://[ffff::]:8080/foo/');
     * addressAndPort.address.correctForm(); // 'ffff::'
     * addressAndPort.port; // 8080
     */
    static fromURL(url: string): {
        error: string;
        address: null;
        port: null;
    } | {
        address: Address6;
        port: number | null;
        error?: undefined;
    };
    /**
     * Construct an `Address6` from an address and a hex subnet mask given as
     * separate strings (e.g. as returned by Node's `os.networkInterfaces()`).
     * Throws `AddressError` if the mask is non-contiguous (e.g.
     * `ffff::ffff`).
     * @example
     * var address = Address6.fromAddressAndMask('fe80::1', 'ffff:ffff:ffff:ffff::');
     * address.subnetMask; // 64
     */
    static fromAddressAndMask(address: string, mask: string): Address6;
    /**
     * Construct an `Address6` from an address and a Cisco-style wildcard mask
     * given as separate strings (e.g. `::ffff:ffff:ffff:ffff` for a `/64`).
     * The wildcard mask is the bitwise inverse of the subnet mask. Throws
     * `AddressError` if the mask is non-contiguous.
     * @example
     * var address = Address6.fromAddressAndWildcardMask('fe80::1', '::ffff:ffff:ffff:ffff');
     * address.subnetMask; // 64
     */
    static fromAddressAndWildcardMask(address: string, wildcardMask: string): Address6;
    /**
     * Construct an `Address6` from a wildcard pattern with trailing `*`
     * groups. The number of trailing wildcards determines the prefix
     * length: each `*` represents 16 bits. `::` is expanded to zero groups
     * (not wildcards) before evaluating trailing wildcards.
     *
     * Only trailing whole-group wildcards are supported. Partial-group
     * wildcards (e.g. `2001:db8::0*`) and interior wildcards (e.g.
     * `*::1`) throw `AddressError`.
     * @example
     * Address6.fromWildcard('2001:db8:*:*:*:*:*:*').subnet;  // '/32'
     * Address6.fromWildcard('2001:db8::*').subnet;           // '/112'
     * Address6.fromWildcard('*:*:*:*:*:*:*:*').subnet;       // '/0'
     */
    static fromWildcard(input: string): Address6;
    /**
     * Create an IPv6-mapped address given an IPv4 address
     * @param {string} address - An IPv4 address string
     * @returns {Address6}
     * @example
     * var address = Address6.fromAddress4('192.168.0.1');
     * address.correctForm(); // '::ffff:c0a8:1'
     * address.to4in6(); // '::ffff:192.168.0.1'
     */
    static fromAddress4(address: string): Address6;
    /**
     * Return an address from ip6.arpa form
     * @param {string} arpaFormAddress - an 'ip6.arpa' form address
     * @returns {Adress6}
     * @example
     * var address = Address6.fr
```

---

# COMANDO - ipv6.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\ip-address@10.5.0@@@1\dist\ipv6.d.ts
**SHA:** af66dae1bab5c39a
**Timestamp:** 2026-08-28T02:24:39.976453
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- getBits(start: number, end: number): bigint;
- getBitsBase2(start: number, end: number): string;
- getBitsBase16(start: number, end: number): string;

### Ouro Bruto (primeiros 5000 chars)
```
import * as common from './common';
import { Address4 } from './ipv4';
interface SixToFourProperties {
    prefix: string;
    gateway: string;
}
interface TeredoProperties {
    prefix: string;
    server4: string;
    client4: string;
    flags: string;
    coneNat: boolean;
    microsoft: {
        reserved: boolean;
        universalLocal: boolean;
        groupIndividual: boolean;
        nonce: string;
    };
    udpPort: string;
}
/**
 * Represents an IPv6 address
 * @param {string} address - An IPv6 address string
 * @param {number} [groups=8] - How many octets to parse
 * @example
 * var address = new Address6('2001::/32');
 */
export declare class Address6 {
    address4?: Address4;
    address: string;
    addressMinusSuffix: string;
    elidedGroups?: number;
    elisionBegin?: number;
    elisionEnd?: number;
    groups: number;
    parsedAddress4?: string;
    parsedAddress: string[];
    parsedSubnet: string;
    subnet: string;
    subnetMask: number;
    v4: boolean;
    zone: string;
    private _binaryZeroPad?;
    constructor(address: string, optionalGroups?: number);
    /**
     * Returns true if the given string is a valid IPv6 address (with optional
     * CIDR subnet and zone identifier), false otherwise. Host bits in the
     * subnet portion are allowed (e.g. `2001:db8::1/32` is valid); for strict
     * network-address validation compare `correctForm()` to
     * `startAddress().correctForm()`, or use `networkForm()`.
     */
    static isValid(address: string): boolean;
    /**
     * Convert a BigInt to a v6 address object. The value must be in the
     * range `[0, 2**128 - 1]`; otherwise `AddressError` is thrown.
     * @param {bigint} bigInt - a BigInt to convert
     * @returns {Address6}
     * @example
     * var bigInt = BigInt('1000000000000');
     * var address = Address6.fromBigInt(bigInt);
     * address.correctForm(); // '::e8:d4a5:1000'
     */
    static fromBigInt(bigInt: bigint): Address6;
    /**
     * Parse a URL (with optional bracketed host and port) into an address and
     * port. Returns either `{ address, port }` on success or
     * `{ error, address: null, port: null }` if the URL could not be parsed.
     * Ports are returned as numbers (or `null` if absent or out of range).
     * @example
     * var addressAndPort = Address6.fromURL('http://[ffff::]:8080/foo/');
     * addressAndPort.address.correctForm(); // 'ffff::'
     * addressAndPort.port; // 8080
     */
    static fromURL(url: string): {
        error: string;
        address: null;
        port: null;
    } | {
        address: Address6;
        port: number | null;
        error?: undefined;
    };
    /**
     * Construct an `Address6` from an address and a hex subnet mask given as
     * separate strings (e.g. as returned by Node's `os.networkInterfaces()`).
     * Throws `AddressError` if the mask is non-contiguous (e.g.
     * `ffff::ffff`).
     * @example
     * var address = Address6.fromAddressAndMask('fe80::1', 'ffff:ffff:ffff:ffff::');
     * address.subnetMask; // 64
     */
    static fromAddressAndMask(address: string, mask: string): Address6;
    /**
     * Construct an `Address6` from an address and a Cisco-style wildcard mask
     * given as separate strings (e.g. `::ffff:ffff:ffff:ffff` for a `/64`).
     * The wildcard mask is the bitwise inverse of the subnet mask. Throws
     * `AddressError` if the mask is non-contiguous.
     * @example
     * var address = Address6.fromAddressAndWildcardMask('fe80::1', '::ffff:ffff:ffff:ffff');
     * address.subnetMask; // 64
     */
    static fromAddressAndWildcardMask(address: string, wildcardMask: string): Address6;
    /**
     * Construct an `Address6` from a wildcard pattern with trailing `*`
     * groups. The number of trailing wildcards determines the prefix
     * length: each `*` represents 16 bits. `::` is expanded to zero groups
     * (not wildcards) before evaluating trailing wildcards.
     *
     * Only trailing whole-group wildcards are supported. Partial-group
     * wildcards (e.g. `2001:db8::0*`) and interior wildcards (e.g.
     * `*::1`) throw `AddressError`.
     * @example
     * Address6.fromWildcard('2001:db8:*:*:*:*:*:*').subnet;  // '/32'
     * Address6.fromWildcard('2001:db8::*').subnet;           // '/112'
     * Address6.fromWildcard('*:*:*:*:*:*:*:*').subnet;       // '/0'
     */
    static fromWildcard(input: string): Address6;
    /**
     * Create an IPv6-mapped address given an IPv4 address
     * @param {string} address - An IPv4 address string
     * @returns {Address6}
     * @example
     * var address = Address6.fromAddress4('192.168.0.1');
     * address.correctForm(); // '::ffff:c0a8:1'
     * address.to4in6(); // '::ffff:192.168.0.1'
     */
    static fromAddress4(address: string): Address6;
    /**
     * Return an address from ip6.arpa form
     * @param {string} arpaFormAddress - an 'ip6.arpa' form address
     * @returns {Adress6}
     * @example
     * var address = Address6.fr
```