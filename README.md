# Дамп всего проекта (components, css, js + корневые файлы)

python dump_web_project.py

# Дамп только компонентов

python dump_web_project.py --target components

# Дамп только JS и данных

python dump_web_project.py --target js

# Дамп только данных (cards.json)

python dump_web_project.py --target js/data

# Свое имя файла

python dump_web_project.py --output my_project_dump.txt
