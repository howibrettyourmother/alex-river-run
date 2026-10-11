# TTS pipeline: piper (offline, /workspace/.tts) -> gentle pitch lift -> 24k mono mp3 into /tmp/arr, then build.py copies to src/clips
# lines.txt format: key|text|voice|pitch   (FORCE=1 to regenerate)
set -e
P=/workspace/.tts/venv/bin/piper;V=/workspace/.tts
mkdir -p /tmp/arr && cd /tmp/arr
while IFS='|' read -r k t v p; do
  [ -z "$k" ] && continue
  [ -f $k.mp3 ] && [ "$FORCE" != 1 ] && continue
  echo "$t" | $P -m $V/en_US-$v-medium.onnx -f raw_$k.wav --length-scale 0.95 >/dev/null 2>&1
  ffmpeg -y -loglevel error -i raw_$k.wav -af "asetrate=22050*$p,aresample=24000,atempo=$(python3 -c "print(round(0.96/$p*1.08,3))"),highpass=f=110,acompressor=threshold=-18dB:ratio=3,volume=1.8,alimiter=limit=0.95,silenceremove=start_periods=1:start_threshold=-45dB" -ac 1 -ar 24000 -b:a 32k $k.mp3
  echo $k $(stat -c%s $k.mp3)
done < /workspace/alex-river-run/src/lines.txt
