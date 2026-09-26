# Telegram menu and card style — profile pivete

## Trigger

Use this reference when changing the Telegram menu, command descriptions, or visual formatting for `@Guardiaodopivete_bot` through Hermes profile `pivete`.

## Stable design decisions

- Keep slash-command **names** in Hermes' canonical form (`/help`, `/status`, `/model`, etc.). Translating command names breaks dispatch and aliases.
- Localize the `BotCommand.description` values at the Telegram adapter boundary. Do not rewrite the central command registry, because CLI/Discord/other consumers share it.
- Register localized commands for every relevant Bot API scope: default, all private chats, all group chats, and lazily for forum chat scopes.
- The menu must be registered by the adapter on every connection/reconnect. A one-off `setMyCommands` API call is not a durable implementation; reconnecting the gateway can overwrite it.

## Configuration

Use the official config command, not a blind edit of the protected YAML:

```bash
hermes --profile pivete config set telegram.extra.language pt-BR
hermes --profile pivete config set telegram.extra.card_style true
hermes --profile pivete config set telegram.extra.card_width 52
hermes --profile pivete config set telegram.extra.card_title HERMES
```

After setting values, re-read `config.yaml` and restart the gateway. Config values are behavioral settings and belong in `config.yaml`; bot credentials remain in `.env` and must never be printed.

## Card renderer contract

The house visual standard is copy-friendly HTML `<pre>`:

- boxed Unicode header (`┌─┐`, `│ title │`, `└─┘`);
- mono-spaced body with deliberate blank-line spacing;
- width clamped to a safe Telegram range;
- long lines wrapped before HTML escaping;
- URLs preserved as plain text for copy/paste;
- raw Markdown/ANSI reduced to plain text before entering `<pre>`;
- every split message gets a complete card and valid HTML;
- use `ParseMode.HTML` for cards and bypass Rich Messages, since Rich/Markdown rendering can destroy alignment;
- retain a plain-text fallback if Telegram rejects HTML.

Telegram controls bubble color and its native copy affordance; the adapter cannot force those client-side colors. `<pre>` is the correct server-side mechanism for the visual effect.

## Delivery verification

Do not call the feature done from a code diff alone:

1. restart the `pivete` gateway after code/config changes;
2. verify logs show Telegram polling connected and command registration succeeds;
3. inspect `getMyCommands` without exposing the bot token;
4. send a real authorized-chat test message;
5. verify the received card visually and confirm a long response still splits cleanly.

If another gateway reports `token already in use`, stop the duplicate owner first. Only one long-polling gateway may own the bot token. Avoid installing a second startup entry while an old default-profile launcher still exists.
