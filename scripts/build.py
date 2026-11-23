"""Génère sw.js à partir de sw.template.js : liste de tous les fichiers à mettre en cache
+ version = empreinte du contenu (toute modification force la mise à jour sur le téléphone).
Usage : python3 scripts/build.py"""
import hashlib, json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
include = ['index.html', 'manifest.webmanifest', 'css', 'js', 'img', 'fonts', 'icons']
files = []
for p in include:
    full = os.path.join(root, p)
    if os.path.isfile(full): files.append(p)
    else:
        for d, _, fs in os.walk(full):
            for f in fs:
                if f.endswith(('.txt', '.md')): continue
                files.append(os.path.relpath(os.path.join(d, f), root).replace(os.sep, '/'))
files.sort()
h = hashlib.sha256()
for f in files: h.update(f.encode()); h.update(open(os.path.join(root, f), 'rb').read())
version = h.hexdigest()[:10]
assets = ['./'] + ['./' + f for f in files]
tpl = open(os.path.join(root, 'sw.template.js')).read()
open(os.path.join(root, 'sw.js'), 'w').write(tpl.replace('__VERSION__', version).replace('__ASSETS__', json.dumps(assets, indent=1)))
print(f'sw.js : {len(assets)} fichiers, version {version}')
