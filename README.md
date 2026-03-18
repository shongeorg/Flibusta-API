# Flibusta API

Простий REST API для пошуку та завантаження книг з Flibusta.

## Швидкий старт

```bash
npm install
npm run dev
```

Сервер запуститься на `http://localhost:4444`

## API

### Отримати інструкцію

```
GET /
```

Повертає JSON з описом всіх ендпоінтів.

---

### Пошук книг

```
GET /api/search?name={query}
```

**Параметри:**
- `name` (required) — назва книги або автор

**Приклад:**
```bash
curl "http://localhost:4444/api/search?name=lovecraft"
```

**Відповідь:**
```json
[
  {
    "id": "2085",
    "title": "H P Lovecraft 'Bear star'",
    "author": "Дмитрий Антонов (Грасси)"
  }
]
```

---

### Завантаження книги

```
GET /api/download/:id?format={format}
```

**Параметри:**
- `id` (required) — ID книги з результатів пошуку
- `format` (optional) — формат: `epub`, `fb2`, `txt` (за замовчуванням `epub`)

**Приклад:**
```bash
curl -O "http://localhost:4444/api/download/2085?format=epub"
```

Файл завантажиться з назвою книги: `H P Lovecraft 'Bear star'.epub`

---

## Змінні оточення

Створіть файл `.env` (опціонально):

```env
PORT=4444
```

## Розробка

```bash
# Запуск з авто-рестартом
npm run dev

# Звичайний запуск
npm start
```

## Ліцензія

ISC
