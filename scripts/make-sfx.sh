#!/usr/bin/env bash
# Builds the reels SFX library in public/sfx/ (48 kHz stereo WAV, peak -1 dBFS).
#  - synth_*  : generated here with ffmpeg (ours, no license issues)
#  - kenney_* : CC0 sounds by Kenney (www.kenney.nl), converted from .ogg
# usage: bash scripts/make-sfx.sh [KENNEY_OGG_DIR]
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/sfx
TMP=$(mktemp -d)
mkdir -p "$OUT"
SR=48000

# gen NAME DURATION 'EXPR(t)' [extra audio filters]
gen() {
  local name=$1 d=$2 expr=$3 af=${4:-anull}
  ffmpeg -v error -y -f lavfi -i "aevalsrc=exprs='$expr':s=$SR:d=$d" -af "$af" "$TMP/$name.wav"
}

# --- bubbles / pops (CapCut "bubble pop" family: fast upward pitch chirp, tiny decay)
gen bubble-pop-1 0.10 'sin(2*PI*(400*t+6666*t*t))*(1-exp(-t*600))*exp(-t*45)'
gen bubble-pop-2 0.08 'sin(2*PI*(600*t+11428*t*t))*(1-exp(-t*800))*exp(-t*55)'
gen bubble-pop-low 0.12 'sin(2*PI*(250*t+2954*t*t))*(1-exp(-t*500))*exp(-t*38)'
gen bloop-down 0.16 'sin(2*PI*(1400*t-3666*t*t))*(1-exp(-t*500))*exp(-t*28)'
gen pop 0.15 '(sin(2*PI*(180*t-200*t*t))*exp(-t*35)+0.45*(random(0)*2-1)*exp(-t*300))' 'lowpass=f=3000'
# cluster of bubbles
ffmpeg -v error -y -i "$TMP/bubble-pop-1.wav" -i "$TMP/bubble-pop-2.wav" -i "$TMP/bubble-pop-low.wav" \
  -i "$TMP/bubble-pop-2.wav" -i "$TMP/bubble-pop-1.wav" -filter_complex \
  "[1]adelay=70[b];[2]adelay=150[c];[3]adelay=210,asetrate=$SR*1.25,aresample=$SR[d];[4]adelay=300,asetrate=$SR*0.85,aresample=$SR[e];[0][b][c][d][e]amix=inputs=5:normalize=0" \
  "$TMP/bubbles.wav"

# --- whooshes (filtered noise with a swell; transitions / graphic entrances)
gen whoosh 0.6 '(random(0)*2-1)*pow(sin(PI*t/0.6),3)' 'highpass=f=350,bandpass=f=1400:width_type=o:w=2.2,lowpass=f=5000'
gen whoosh-fast 0.32 '(random(0)*2-1)*pow(sin(PI*t/0.32),2)' 'highpass=f=600,bandpass=f=2200:width_type=o:w=2,lowpass=f=7000'
gen whoosh-deep 0.9 '(random(0)*2-1)*pow(sin(PI*t/0.9),3)' 'highpass=f=80,lowpass=f=900'
gen swipe 0.25 '(random(0)*2-1)*pow(sin(PI*t/0.25),2)*(0.4+t*3)' 'highpass=f=1500,lowpass=f=9000'

# --- riser (builds tension, ends abruptly on the cut)
gen riser 1.6 '(0.55*(random(0)*2-1)+0.45*sin(2*PI*(200*t+500*t*t)))*pow(t/1.6,2.2)' 'highpass=f=150,aecho=0.8:0.5:40:0.3'

# --- shimmer / sparkle (magic reveal)
gen sparkle 1.0 'gt(t,0.00)*sin(2*PI*3520*t)*exp(-t*16)+gt(t,0.07)*sin(2*PI*4186*(t-0.07))*exp(-(t-0.07)*16)+gt(t,0.14)*sin(2*PI*3951*(t-0.14))*exp(-(t-0.14)*16)+gt(t,0.21)*sin(2*PI*4699*(t-0.21))*exp(-(t-0.21)*16)+gt(t,0.28)*sin(2*PI*5274*(t-0.28))*exp(-(t-0.28)*14)' 'aecho=0.8:0.6:90|160:0.35|0.2'

# --- ding / notification
gen ding 1.6 '(sin(2*PI*1760*t)*exp(-t*3)+0.4*sin(2*PI*2637*t)*exp(-t*5)+0.2*sin(2*PI*3520*t)*exp(-t*8))*(1-exp(-t*900))'
gen notify 0.6 'lt(t,0.09)*sin(2*PI*1318*t)*exp(-t*20)+gt(t,0.09)*sin(2*PI*1760*(t-0.09))*exp(-(t-0.09)*9)'

# --- impacts (cinematic boom under a big reveal / text slam)
gen boom 2.2 '(sin(2*PI*(62*t-9*t*t))*exp(-t*2.6)+0.6*(random(0)*2-1)*exp(-t*22))' 'lowpass=f=420,aecho=0.8:0.4:60:0.25'
gen hit 0.5 '(sin(2*PI*(110*t-60*t*t))*exp(-t*12)+0.7*(random(0)*2-1)*exp(-t*60))' 'lowpass=f=2500'

# --- camera shutter
gen shutter 0.25 '(random(0)*2-1)*(exp(-t*90)+gt(t,0.085)*exp(-(t-0.085)*70))' 'bandpass=f=3200:width_type=o:w=2.5'

# --- Kenney CC0 picks
K=${1:-}
if [ -n "$K" ] && [ -d "$K" ]; then
  for pair in click_002:click tick_002:tick drop_002:drop drop_003:drop-2 glass_001:glass glitch_001:glitch glitch_003:glitch-2 \
              switch_002:switch scroll_001:scroll select_001:select confirmation_001:confirm error_003:error pluck_001:pluck \
              maximize_003:ui-open card-slide-1:card-slide phaserUp1:zap-up; do
    src=${pair%%:*}; dst=${pair##*:}
    [ -f "$K/$src.ogg" ] && ffmpeg -v error -y -i "$K/$src.ogg" "$TMP/kenney_$dst.wav"
  done
  # typing: random keyboard clicks
  if [ -f "$TMP/kenney_click.wav" ]; then
    ffmpeg -v error -y $(for i in 0 1 2 3 4 5 6 7 8; do echo -n "-i $TMP/kenney_click.wav "; done) -filter_complex \
      "[1]adelay=110[a1];[2]adelay=190,asetrate=$SR*1.1,aresample=$SR[a2];[3]adelay=330[a3];[4]adelay=420,asetrate=$SR*0.92,aresample=$SR[a4];[5]adelay=560[a5];[6]adelay=640,asetrate=$SR*1.05,aresample=$SR[a6];[7]adelay=790[a7];[8]adelay=900[a8];[0][a1][a2][a3][a4][a5][a6][a7][a8]amix=inputs=9:normalize=0" \
      "$TMP/kenney_typing.wav"
  fi
  # clock ticking (3 s)
  if [ -f "$TMP/kenney_tick.wav" ]; then
    ffmpeg -v error -y -stream_loop 5 -i "$TMP/kenney_tick.wav" -af "apad=pad_dur=0.5" -t 0.5 "$TMP/_t.wav"
    ffmpeg -v error -y -stream_loop 5 -i "$TMP/_t.wav" -t 3 "$TMP/kenney_clock-ticking.wav"; rm "$TMP/_t.wav"
  fi
fi

# --- normalise everything: stereo, 48 kHz, short fade-out, peak -1 dBFS
for f in "$TMP"/*.wav; do
  n=$(basename "$f" .wav)
  case $n in kenney_*) dst=$n ;; *) dst=synth_$n ;; esac
  peak=$(ffmpeg -i "$f" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-\?[0-9.]*\) dB.*/\1/p')
  gain=$(awk -v p="${peak:-0}" 'BEGIN{print -1 - p}')
  ffmpeg -v error -y -i "$f" -af "volume=${gain}dB,aformat=sample_rates=$SR:channel_layouts=stereo" "$OUT/$dst.wav"
done
rm -rf "$TMP"
ls "$OUT"
