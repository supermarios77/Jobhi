# Custom Sound Effects

Place your custom sound files here:

- **click.mp3** - Click sound effect (used for general clicks)
- **theme-switch.mp3** - Theme switch sound effect (used when toggling theme)

## Supported Formats
- MP3 (recommended)
- WAV
- OGG

## File Naming
The files must be named exactly:
- `click.mp3` for click sounds
- `theme-switch.mp3` for theme switch sounds

## Fallback
If custom sound files are not found, the app will automatically use generated sounds via Web Audio API.

## Volume
Default volume is set to 50%. You can adjust this in `lib/utils/sound.ts` if needed.

