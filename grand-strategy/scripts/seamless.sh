#!/bin/sh
# Makes a texture tile seamlessly: blends the image with a copy rolled by half its size,
# keeping the original in the centre and the rolled copy (whose edges match) at the borders.
# usage: scripts/seamless.sh in.jpg out.jpg
set -e
ffmpeg -loglevel error -y -i "$1" -filter_complex "
[0]scale=1024:1024,format=rgb24,split=5[o][a][b][c][d];
[a][b]hstack[top];[c][d]hstack[bot];[top][bot]vstack,crop=1024:1024:512:512[r];
color=c=black:s=1024x1024,format=gray,geq=lum='255*min(1,min(min(X,W-X),min(Y,H-Y))/(W*0.22))'[m];
[o]format=gbrp[og];[r]format=gbrp[rg];[m]format=gray[mg];
[rg][og][mg]maskedmerge,format=yuv420p" -frames:v 1 -q:v 3 "$2"
