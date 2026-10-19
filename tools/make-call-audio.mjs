// Renders the classmates' group-call lines with ElevenLabs text to speech (Eleven v3, audio tags).
// Voices: four synthetic teen voices made with Voice Design. Never clone a real student's voice.
// Needs a paid plan for classroom distribution (free-plan output has no commercial license).
//
//   ELEVENLABS_API_KEY=... CALL_VOICE_JIMIN=... CALL_VOICE_DOYUN=... \
//   CALL_VOICE_SEOYEON=... CALL_VOICE_HYUNWOO=... node tools/make-call-audio.mjs
//
// Output: audio/call-*.mp3, the files listed in js/run/rooms.js (CALL_AUDIO).
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MODEL = "eleven_v3";
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "audio");

// No names: the player's name is typed at runtime and cannot be in a pre-rendered file.
const LINES = [
  { file: "call-1-jimin.mp3", voice: "CALL_VOICE_JIMIN", text: "[laughs] 야, 받았다 받았어. 듣고 있지?" },
  { file: "call-2-doyun.mp3", voice: "CALL_VOICE_DOYUN", text: "그 목소리 한 번만 더 들어 보자. 말해 봐. [laughs]" },
  { file: "call-3-seoyeon.mp3", voice: "CALL_VOICE_SEOYEON", text: "수아한테 사과는 했어?" },
  { file: "call-4-hyunwoo.mp3", voice: "CALL_VOICE_HYUNWOO", text: "[chuckles] 아 진짜 대박이다." },
  { file: "call-5-jimin.mp3", voice: "CALL_VOICE_JIMIN", text: "됐다, 끊어. 내일 학교에서 보자." },
];

const required = ["ELEVENLABS_API_KEY", ...new Set(LINES.map((line) => line.voice))];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
for (const line of LINES) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${process.env[line.voice]}?output_format=mp3_44100_128`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ text: line.text, model_id: MODEL }),
  });
  if (!response.ok) {
    console.error(`${line.file}: ${response.status} ${await response.text()}`);
    process.exit(1);
  }
  await writeFile(join(OUT_DIR, line.file), Buffer.from(await response.arrayBuffer()));
  process.stdout.write(`wrote audio/${line.file}\n`);
}
