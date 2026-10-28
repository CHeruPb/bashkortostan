#!/bin/bash
fetch() {
  local q="$1"; local n="${2:-3}"
  curl -s "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=filetype:bitmap%20$(python -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")&gsrnamespace=6&gsrlimit=$n&prop=imageinfo&iiprop=url|size&iiurlwidth=1400&format=json" | python -c "
import json,sys
d=json.load(sys.stdin)
pages=d.get('query',{}).get('pages',{})
for p in sorted(pages.values(), key=lambda x:x.get('index',0)):
    ii=p.get('imageinfo',[{}])[0]
    w=ii.get('width',0)
    if w>=700:
        print(p['title'],'|',ii.get('thumburl') or ii.get('url'))
"
}
for q in "Toratau" "Shikhany" "Kapova cave" "Shulgan-Tash" "Bashkir horse" "Bashkirs" "Bashkir costume" "yurt Bashkir" "Sabantuy" "kurai" "Salvia lutescens" "Bashkir honey" "Ufa panorama" "Kandrykul" "Bashkir cuisine" "chak chak" "Гостиница Башкортостан" "Ufa skyline"; do
  echo "=== $q"; fetch "$q"
done
