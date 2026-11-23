"""Copie et compresse les images du programme depuis free-exercise-db (domaine public).
Usage : python3 scripts/build_exercises.py /chemin/vers/free-exercise-db"""
import json, sys, os
from PIL import Image
src = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(here)
m = json.load(open(os.path.join(here, 'exercise_map.json')))
db = {e['id']: e for e in json.load(open(os.path.join(src, 'dist', 'exercises.json')))}
out = {}
for i in sorted({x for v in m.values() for x in v}):
    e = db[i]; os.makedirs(os.path.join(root, 'img', i), exist_ok=True); imgs = []
    for k, p in enumerate(e['images'][:2]):
        im = Image.open(os.path.join(src, 'exercises', p)).convert('RGB')
        im.thumbnail((520, 520))
        dst = f'img/{i}/{k}.webp'
        im.save(os.path.join(root, dst), 'WEBP', quality=68)
        imgs.append(dst)
    out[i] = {'name': e['name'], 'equipment': e.get('equipment'), 'primary': e['primaryMuscles'], 'instructions': e['instructions'], 'images': imgs}
with open(os.path.join(root, 'js', 'library.js'), 'w') as f:
    f.write('// Généré par scripts/build_exercises.py — source : free-exercise-db (domaine public)\nexport const LIB = ' + json.dumps(out, ensure_ascii=False) + ';\nexport const VARIANTS = ' + json.dumps(m) + ';\n')
print(len(out), 'exercices')
