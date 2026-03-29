#!/usr/bin/env python3
"""
Скрипт для дампа веб-проекта (HTML/CSS/JS) в один текстовый файл.
Адаптирован под структуру: components/, css/, js/, images/, корневые .html

Примеры:
    python dump_web_project.py                          # дамп основных папок
    python dump_web_project.py --target components      # дамп только компонентов
    python dump_web_project.py --target js/data         # дамп только данных
"""

import sys
import os
import argparse
from pathlib import Path
from datetime import datetime

# =============================================================================
# КОНФИГУРАЦИЯ
# =============================================================================

# Корень проекта (где лежит этот скрипт)
ROOT = Path(__file__).parent

# Папка для вывода дампов
OUTPUT_DIR = ROOT / "parcing"

# =============================================================================
# ЦЕЛЕВЫЕ ДИРЕКТОРИИ ПО УМОЛЧАНИЮ (если не указан --target)
# =============================================================================
DEFAULT_TARGET_DIRS = [
    # HTML компоненты
    "components",
    # Стили
    "css",
    # Скрипты и данные
    "js",
]

# =============================================================================
# РАЗРЕШЁННЫЕ РАСШИРЕНИЯ ФАЙЛОВ
# =============================================================================
ALLOWED_EXTENSIONS = {
    # Web Core
    ".html",
    ".htm",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".js",
    ".jsx",
    ".mjs",
    ".ts",
    ".tsx",
    # Data & Configs
    ".json",
    ".yaml",
    ".yml",
    ".env",
    ".env.example",
    # Documentation
    ".md",
    ".txt",
    # Config files (no extension or specific names)
    ".gitignore",
    ".editorconfig",
    "package.json",
    "tsconfig.json",
    "jsconfig.json",
    "README",
    "LICENSE",
}

# =============================================================================
# ИСКЛЮЧЕНИЯ (ПАПКИ И ФАЙЛЫ)
# =============================================================================
IGNORE_DIRS = {
    ".git",
    "node_modules",
    "bower_components",
    ".venv",
    "venv",
    ".pytest_cache",
    ".idea",
    ".vscode",
    "dist",
    "build",
    "out",
    "coverage",
    ".cache",
    "parcing",  # Папка вывода дампов
    "images",  # Игнорируем папку с изображениями (png, svg)
}

IGNORE_FILES = {
    # Lock files
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    # Binary / Media (на всякий случай, хотя images/ игнорируется)
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.bmp",
    "*.ico",
    "*.webp",
    "*.svg",
    "*.mp4",
    "*.webm",
    "*.mp3",
    "*.wav",
    "*.woff",
    "*.woff2",
    "*.ttf",
    "*.eot",
    "*.pdf",
    "*.doc",
    "*.docx",
    # System / Temp
    ".DS_Store",
    "Thumbs.db",
    "*.log",
    "*.logs",
    "*.bak",
    "*.swp",
    "*.swo",
    "*~",
    # Minified
    "*.min.js",
    "*.min.css",
    "*.bundle.js",
}


# =============================================================================
# ФУНКЦИИ
# =============================================================================


def parse_args():
    """Парсинг аргументов командной строки"""
    parser = argparse.ArgumentParser(description="Дамп веб-проекта (HTML/CSS/JS)")
    parser.add_argument(
        "--target",
        "-t",
        type=str,
        help="Конкретная папка для дампа (например: components, js/data)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        help="Имя выходного файла (по умолчанию: web_dump_дата_время.txt)",
    )
    parser.add_argument(
        "--depth", "-d", type=int, default=10, help="Глубина дерева (по умолчанию: 10)"
    )
    return parser.parse_args()


def is_ignored_dir(path: Path) -> bool:
    """Проверка, является ли папка игнорируемой."""
    for part in path.parts:
        if part in IGNORE_DIRS or part.startswith("."):
            return True
    return False


def is_ignored_file(path: Path) -> bool:
    """Проверка, является ли файл игнорируемым."""
    # Проверка по имени
    if path.name in IGNORE_FILES:
        return True

    # Проверка по расширению
    if path.suffix and path.suffix not in ALLOWED_EXTENSIONS:
        return True

    # Проверка на вхождение паттернов в путь (для *.min.js и т.д.)
    path_str = str(path)
    for pattern in IGNORE_FILES:
        if pattern.startswith("*") and pattern[1:] in path_str:
            return True

    # Исключаем файлы в папке parcing (чтобы не дампить сами дампы)
    if "parcing" in path.parts:
        return True

    return False


def get_file_size_mb(path: Path) -> float:
    """Получить размер файла в МБ."""
    try:
        return path.stat().st_size / (1024 * 1024)
    except:
        return 0.0


def dump_file(file_path: Path, out_handle, root_path: Path):
    """Записать содержимое файла в дамп."""
    try:
        rel_path = file_path.relative_to(root_path)
    except ValueError:
        rel_path = file_path

    # Проверка размера (пропускаем файлы > 5 МБ)
    file_size = get_file_size_mb(file_path)
    if file_size > 5.0:
        out_handle.write(f"\n### SKIPPED (>{file_size:.1f}MB): {rel_path} ###\n\n")
        return

    out_handle.write(f"\n{'=' * 80}\n")
    out_handle.write(f"### FILE: {rel_path} ###\n")
    out_handle.write(f"### SIZE: {file_size:.2f} MB ###\n")
    out_handle.write(f"{'=' * 80}\n\n")

    try:
        content = None
        for encoding in ["utf-8", "latin-1", "cp1251"]:
            try:
                content = file_path.read_text(encoding=encoding, errors="ignore")
                break
            except:
                continue

        if content:
            out_handle.write(content)
            if not content.endswith("\n"):
                out_handle.write("\n")
        else:
            out_handle.write("[ERROR: Could not decode file]\n")

    except Exception as e:
        out_handle.write(f"[ERROR READING FILE: {type(e).__name__}: {e}]\n")

    out_handle.write(f"\n{'=' * 80}\n")
    out_handle.write(f"### END OF FILE: {rel_path} ###\n")
    out_handle.write(f"{'=' * 80}\n\n")


def write_tree_structure(out_handle, root_path: Path, depth: int = 4):
    """Записать структуру дерева файлов в начало дампа."""
    out_handle.write("=" * 80 + "\n")
    out_handle.write("PROJECT STRUCTURE\n")
    out_handle.write("=" * 80 + "\n\n")

    try:
        import subprocess

        ignore_pattern = "|".join(
            [
                "node_modules",
                "dist",
                "build",
                ".git",
                "coverage",
                "images",
                "*.lock",
                "*.min.js",
                "parcing",
                "*.png",
                "*.svg",
            ]
        )
        result = subprocess.run(
            ["tree", "-L", str(depth), "-I", ignore_pattern],
            cwd=root_path,
            capture_output=True,
            text=True,
            errors="ignore",
        )
        out_handle.write(result.stdout)
    except FileNotFoundError:
        out_handle.write("[tree command not found, skipping structure]\n")
    except Exception as e:
        out_handle.write(f"[Error generating tree: {e}]\n")

    out_handle.write("\n\n")


def process_directory(dir_path: Path, out, root_path: Path):
    """Обработать конкретную директорию"""
    if not dir_path.exists():
        print(f"❌ Directory '{dir_path}' not found.")
        return 0, 0

    print(f"📁 Processing: {dir_path}/")
    files_count = 0
    total_size = 0

    for file_path in sorted(dir_path.rglob("*")):
        if file_path.is_file():
            if is_ignored_dir(file_path):
                continue
            if is_ignored_file(file_path):
                continue

            dump_file(file_path, out, root_path)
            files_count += 1
            total_size += file_path.stat().st_size

    return files_count, total_size


def main():
    """Основная функция."""
    args = parse_args()

    # Определяем имя выходного файла
    if args.output:
        output_file = OUTPUT_DIR / args.output
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if args.target:
            target_name = args.target.replace("/", "_").replace(".", "_")
            output_file = OUTPUT_DIR / f"web_dump_{target_name}_{timestamp}.txt"
        else:
            output_file = OUTPUT_DIR / f"web_project_dump_{timestamp}.txt"

    print("=" * 60)
    print("WEB PROJECT DUMP SCRIPT")
    print("=" * 60)
    print(f"Root: {ROOT}")
    print(f"Output: {output_file}")
    print("=" * 60)

    # Создаем папку для вывода
    OUTPUT_DIR.mkdir(exist_ok=True)

    # Счётчики
    total_files = 0
    total_size = 0

    print("\nScanning project...")

    with open(output_file, "w", encoding="utf-8") as out:
        # Заголовок
        out.write("#" * 80 + "\n")
        out.write(f"# WEB PROJECT DUMP\n")
        out.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        out.write(f"# Root: {ROOT}\n")
        out.write(f"# Target: {args.target if args.target else 'all'}\n")
        out.write(f"# Output: {output_file}\n")
        out.write("#" * 80 + "\n\n")

        # Структура проекта
        print("Generating project structure...")
        write_tree_structure(
            out, ROOT if not args.target else Path(args.target), args.depth
        )

        if args.target:
            # Дамп конкретной папки
            target_path = ROOT / args.target
            files, size = process_directory(target_path, out, ROOT)
            total_files += files
            total_size += size
        else:
            # Дамп всех целевых папок по умолчанию
            for target in DEFAULT_TARGET_DIRS:
                target_path = ROOT / target
                if not target_path.exists():
                    print(f"⚠️  Warning: Directory '{target}' not found, skipping.")
                    continue

                files, size = process_directory(target_path, out, ROOT)
                total_files += files
                total_size += size

            # Важные файлы из корня
            print("📁 Processing root files...")
            root_files = [
                # Основные страницы
                "index.html",
                "article.html",
                # Конфигурации (если есть)
                "package.json",
                "tsconfig.json",
                "jsconfig.json",
                # Docker (если есть)
                "docker-compose.yml",
                "Dockerfile",
                # Окружение
                ".env.example",
                ".gitignore",
                # Документация
                "README.md",
                # Сам скрипт
                "dump_web_project.py",
            ]

            for fname in root_files:
                f_path = ROOT / fname
                if f_path.exists() and not is_ignored_file(f_path):
                    dump_file(f_path, out, ROOT)
                    total_files += 1
                    total_size += f_path.stat().st_size

    # Итоговый отчёт
    print("\n" + "=" * 60)
    print("DUMP COMPLETE!")
    print("=" * 60)
    print(f"📄 Files processed: {total_files}")
    print(f"💾 Total size: {total_size / (1024 * 1024):.2f} MB")
    print(f"📦 Output file: {output_file}")
    print("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
