"""Builds data.js and lecN.html from src/: python3 build.py"""
import json, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
FA = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')

info = {
    'pageTitle': 'ساختمان داده‌ها و الگوریتم‌ها (۴۰۲۵۴) - آرشیو',
    'courseTitle': 'ساختمان داده‌ها و الگوریتم‌ها',
    'courseNum': '۴۰۲۵۴',
    'department': 'دانشگاه صنعتی شریف، دانشکدۀ مهندسی کامپیوتر',
    'semester': 'آرشیو ترم‌های بهار ۹۷-۹۸ تا پاییز ۱۴۰۱-۱۴۰۲',
    'professor': 'مهدی صفرنژاد',
    'inPersonClass': 'هفت ترم، از بهمن ۱۳۹۷ تا دی ۱۴۰۱. درس‌نامۀ کامل جلسه به جلسه، و تمرین‌ها، کوئیزها، امتحان‌ها و چالش‌های هر ترم.',
    'homepages': [
        {'title': 'سایت قدیمی درس', 'link': 'http://ce.sharif.edu/~safarnejad/ce254', 'note': 'دانشکدۀ مهندسی کامپیوتر'},
        {'title': 'کد منبع این سایت', 'link': 'https://github.com/safarnejad/ds-archive', 'note': 'گیت‌هاب'},
    ],
    'bookCover': {'image': 'img/ghodsi.jpg', 'alt': 'مرجع اصلی درس'},
    'references': [
        {'link': 'https://fatemi.ir/book/داده%E2%80%8Cساختارها-و-مبانی-الگوریتم%E2%80%8Cها',
         'title': 'داده‌ساختارها و مبانی الگوریتم‌ها', 'note': '، محمد قدسی، انتشارات فاطمی، ۱۳۸۸.'},
        {'link': 'https://en.wikipedia.org/wiki/Introduction_to_Algorithms', 'title': 'Introduction to Algorithms',
         'note': ' (3rd Edition), Charles E. Leiserson, Clifford Stein, Ronald Rivest, and Thomas H. Cormen, MIT Press, 2009.',
         'isLatin': True},
    ],
    'rulePage': 'rules.html',
    'gradingPage': 'grading.html',
}

ORDINAL = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم', 'هفتم', 'هشتم', 'نهم', 'دهم',
           'یازدهم', 'دوازدهم', 'سیزدهم', 'چهاردهم', 'پانزدهم', 'شانزدهم', 'هفدهم', 'هجدهم', 'نوزدهم', 'بیستم',
           'بیست و یکم', 'بیست و دوم', 'بیست و سوم', 'بیست و چهارم', 'بیست و پنجم', 'بیست و ششم',
           'بیست و هفتم', 'بیست و هشتم', 'بیست و نهم']

LEC = '''<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>جلسۀ {ord}</title>
  <link rel="stylesheet" href="css/all.css" type="text/css" />
</head>
<body>
  <div id="page" class="container mynarrow">
    <p class="lec-nav">{prev}<a href="index.html">صفحۀ اصلی درس</a>{next}</p>
    <h3 class="nomargintop">جلسۀ {ord}: {title}</h3>
    <p><small>مطالعۀ بیشتر: {reading}</small></p>
{toc}{content}
    <hr>
    <p class="mycenter">{prev}<a href="index.html">صفحۀ اصلی درس</a>{next}</p>
  </div>
</body>
</html>
'''


def load(name):
    with open(os.path.join(ROOT, 'src', name), encoding='utf-8') as f:
        return json.load(f)


def write(name, text):
    with open(os.path.join(ROOT, name), 'w', encoding='utf-8') as f:
        f.write(text)


def build_lectures(sessions):
    for i, s in enumerate(sessions):
        with open(os.path.join(ROOT, 'src', 'notes', f'{s["n"]:02d}.html'), encoding='utf-8') as f:
            content = f.read()
        heads = re.findall(r'<h3>(.*?)</h3>', content)
        for k, h in enumerate(heads):  # the page title is h3, so sections become h4 with anchors
            content = content.replace(f'<h3>{h}</h3>', f'<h4 id="s{k + 1}">{h}</h4>', 1)
        toc = ''
        if len(heads) > 1:
            items = ''.join(f'<li><a href="#s{k + 1}">{h}</a></li>' for k, h in enumerate(heads))
            toc = f'    <div class="toc"><small>فهرست این جلسه</small><ul>{items}</ul></div>\n'
        prev = f'<a href="lec{s["n"] - 1}.html">جلسۀ قبل</a> - ' if i > 0 else ''
        nxt = f' - <a href="lec{s["n"] + 1}.html">جلسۀ بعد</a>' if i + 1 < len(sessions) else ''
        write(f'lec{s["n"]}.html', LEC.format(ord=ORDINAL[s['n'] - 1], title=s['title'], reading=s['reading'],
                                               content=content, toc=toc, prev=prev, next=nxt))


def build_data(sessions, terms):
    rows = [{'num': str(s['n']).translate(FA), 'subject': s['title'], 'further': s['reading'],
             'notes': [{'name': 'مشاهده', 'link': f'lec{s["n"]}.html'}]} for s in sessions]
    for t in terms:
        t['tasCount'] = str(len(t['tas'])).translate(FA)
        if 'tas_note' in t:
            t['tasNote'] = re.sub(r'<[^>]+>', '', t.pop('tas_note'))
    js = ''.join(f'const {k} = {json.dumps(v, ensure_ascii=False, indent=4)}\n\n'
                 for k, v in [('info', info), ('sessions', rows), ('marks', []), ('terms', terms)])
    write('data.js', js)


if __name__ == '__main__':
    sessions, terms = load('sessions.json'), load('terms.json')
    build_lectures(sessions)
    build_data(sessions, terms)
