from pathlib import Path
from html.parser import HTMLParser
import json, re

SOURCE = Path('legacy/index.html')
OUT = Path('data/memories.json')

class TextParser(HTMLParser):
    BLOCK = {'h1','h2','h3','h4','h5','h6','p','blockquote','li','button','figcaption','time','dt','dd','a','span'}
    SKIP = {'script','style','noscript','template','svg'}
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.buf = []
        self.items = []
    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP: self.skip += 1
        if tag in self.BLOCK and self.skip == 0: self.buf = []
    def handle_endtag(self, tag):
        if tag in self.BLOCK and self.skip == 0 and self.buf:
            text = clean(' '.join(self.buf))
            if len(text) > 2: self.items.append({'text': text, 'tag': tag})
            self.buf = []
        if tag in self.SKIP and self.skip: self.skip -= 1
    def handle_data(self, data):
        if self.skip == 0 and data.strip(): self.buf.append(data)

def clean(s):
    return re.sub(r'\s+', ' ', s).strip()

def unique(items):
    seen=set(); out=[]
    for x in items:
        k=x['text'].lower()
        if k not in seen:
            seen.add(k); out.append(x)
    return out

if not SOURCE.exists(): raise SystemExit('legacy/index.html not found')
parser=TextParser(); parser.feed(SOURCE.read_text(encoding='utf-8', errors='ignore'))
items=unique(parser.items)
texts=[x['text'] for x in items]

def match(pattern):
    rx=re.compile(pattern, re.I)
    return [{'id': f'm{i+1:04d}', 'text': x['text'], 'sourceTag': x['tag']} for i,x in enumerate(items) if rx.search(x['text'])]

# Preserve source-derived text while giving V2 stable collections.
every27=match(r'\b27\b|happy\s*27|tanggal\s*27')
sayang=match(r'sayang')
little=match(r'momen|memory|little|kopi|coffee|love|small|thing')
months=r'januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember'
calendar=match(months)

payload={
  'version': 2,
  'project': {'title':'MyWinter','startDate':'2025-11-27'},
  'all': [{'id':f'm{i+1:04d}','text':x['text'],'sourceTag':x['tag']} for i,x in enumerate(items)],
  'every27': every27,
  'sayang': sayang,
  'littleThings': little,
  'calendar': calendar,
  'constellation': [{'id':'constellation-01','label':'the shape between us.'}],
  'meta': {'source':'legacy/index.html','sourceItemCount':len(items)}
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Extracted {len(items)} source items -> {OUT}')
