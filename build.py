"""Builds the archive pages from src/: python3 build.py"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))
COURSE = 'ساختمان داده‌ها و الگوریتم‌ها'
FA = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')


def fa(x):
    return str(x).translate(FA)


def load(name):
    with open(os.path.join(ROOT, 'src', name), encoding='utf-8') as f:
        return json.load(f)


def page(title, body, depth=0):
    up = '../' * depth
    return f'''<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="{up}assets/style.css">
</head>
<body>
<div class="page">
<nav class="top">
  <a class="home" href="{up}index.html">{COURSE}</a>
  <a href="{up}index.html#notes">درس‌نامه</a>
  <a href="{up}index.html#terms">ترم‌ها</a>
  <a href="{up}tas.html">دستیاران آموزشی</a>
</nav>
{body}
<footer>مهدی صفرنژاد، دانشکدۀ مهندسی کامپیوتر دانشگاه صنعتی شریف، ۱۳۹۷ تا ۱۴۰۱.
محتوای این سایت تحت مجوز <a href="https://creativecommons.org/licenses/by/4.0/deed.fa">CC BY 4.0</a> منتشر شده است.</footer>
</div>
</body>
</html>
'''


def write(path, html):
    path = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)


def note_path(n):
    return f'notes/{n:02d}.html'


def build_notes(sessions):
    for i, s in enumerate(sessions):
        src = os.path.join(ROOT, 'src', note_path(s['n']))
        if not os.path.exists(src):
            continue
        with open(src, encoding='utf-8') as f:
            content = f.read()
        prev = f'<a href="{s["n"] - 1:02d}.html">→ جلسۀ {fa(s["n"] - 1)}</a>' if i > 0 else '<span></span>'
        nxt = f'<a href="{s["n"] + 1:02d}.html">جلسۀ {fa(s["n"] + 1)} ←</a>' if i + 1 < len(sessions) else '<span></span>'
        body = f'''<h1>جلسۀ {fa(s["n"])}: {s["title"]}</h1>
<p class="sub">مطالعۀ بیشتر: {s["reading"]}</p>
{content}
<div class="pager">{prev}{nxt}</div>'''
        write(note_path(s['n']), page(f'جلسۀ {fa(s["n"])}: {s["title"]}', body, depth=1))


def build_index(sessions, terms):
    rows, part = [], None
    for s in sessions:
        if s['part'] != part:
            part = s['part']
            rows.append(f'<tr class="part"><td colspan="3">{part}</td></tr>')
        title = s['title']
        if os.path.exists(os.path.join(ROOT, 'src', note_path(s['n']))):
            title = f'<a href="{note_path(s["n"])}">{title}</a>'
        rows.append(f'<tr><td class="num">{fa(s["n"])}</td><td>{title}</td><td class="meta">{s["reading"]}</td></tr>')
    cards = ''.join(f'<a class="card" href="terms/{t["id"]}.html"><b>{t["name"]}</b><span class="meta">{t["summary"]}</span></a>' for t in terms)
    body = f'''<h1>{COURSE} (۴۰۲۵۴)</h1>
<p class="sub">آرشیو درسی که از بهار ۱۳۹۸ تا پاییز ۱۴۰۱ در دانشکدۀ مهندسی کامپیوتر دانشگاه صنعتی شریف ارائه کردم.</p>
<p>این صفحه همۀ آن چیزی است که از این درس مانده: درس‌نامۀ کامل جلسه به جلسه، تمرین‌ها، کوئیزها، امتحان‌ها و چالش‌های هر ترم به همراه پاسخ‌ها، و نام همۀ کسانی که در این سال‌ها دستیار آموزشی درس بودند.
مرجع اصلی درس کتاب <a href="https://fatemi.ir/book/داده‌ساختارها-و-مبانی-الگوریتم‌ها">داده‌ساختارها و مبانی الگوریتم‌ها</a> نوشتۀ دکتر محمد قدسی است و از کتاب CLRS هم استفاده می‌شد.</p>
<h2 id="notes">درس‌نامه</h2>
<table>
<tr><th></th><th>جلسه</th><th>مطالعۀ بیشتر</th></tr>
{''.join(rows)}
</table>
<h2 id="terms">ترم‌ها</h2>
<p>تمرین‌ها، کوئیزها، امتحان‌ها، چالش و پروژۀ ویکی هر ترم، همه با پاسخ.</p>
<div class="cards">{cards}</div>'''
    write('index.html', page(f'{COURSE} — آرشیو', body))


def build_terms(terms):
    for t in terms:
        parts = []
        for g in t['groups']:
            items = ''.join(f'<li><a href="../{it["file"]}">{it["title"]}</a>'
                            + ''.join(f' · <a href="../{x["file"]}">{x["title"]}</a>' for x in it.get('extra', []))
                            + '</li>' for it in g['items'])
            parts.append(f'<h2>{g["title"]}</h2>\n{g.get("intro", "")}\n<ul>{items}</ul>')
        tas = '، '.join(f'{p["name"]} ({p["role"]})' if p.get('role') else p['name'] for p in t['tas'])
        body = f'''<h1>{t["name"]}</h1>
<p class="sub">{t["summary"]}</p>
{''.join(parts)}
<h2>دستیاران آموزشی</h2>
<p>{tas}</p>
{t.get("tas_note", "")}'''
        write(f'terms/{t["id"]}.html', page(f'{t["name"]} — {COURSE}', body, depth=1))


def build_tas(terms):
    people = {}
    for t in terms:
        for p in t['tas']:
            people.setdefault(p['name'], []).append((t['name'], p.get('role', '')))
    rows = ''.join(f'<tr><td>{name}</td><td>{"<br>".join(f"{term}" + (f" <span class=meta>({role})</span>" if role else "") for term, role in hist)}</td></tr>'
                   for name, hist in sorted(people.items()))
    per_term = ''.join(f'<h3><a href="terms/{t["id"]}.html">{t["name"]}</a></h3><p>'
                       + '، '.join(f'{p["name"]}' + (f' <span class="meta">({p["role"]})</span>' if p.get('role') else '') for p in t['tas'])
                       + f'</p>{t.get("tas_note", "")}' for t in terms)
    body = f'''<h1>دستیاران آموزشی</h1>
<p class="sub">{fa(len(people))} نفر در {fa(len(terms))} ترم. این درس بدون آن‌ها ممکن نبود.</p>
<h2>به تفکیک ترم</h2>
{per_term}
<h2>به ترتیب الفبا</h2>
<table><tr><th>نام</th><th>ترم (نقش)</th></tr>{rows}</table>'''
    write('tas.html', page(f'دستیاران آموزشی — {COURSE}', body))


if __name__ == '__main__':
    sessions, terms = load('sessions.json'), load('terms.json')
    build_notes(sessions)
    build_index(sessions, terms)
    build_terms(terms)
    build_tas(terms)
