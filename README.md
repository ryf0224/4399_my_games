# 4399 My Games 🎮

A lightweight web platform for browsing and playing web games. No login required — just open and play.

---

## Features

- **Hero carousel** — featured games auto-rotate every 5 seconds with smooth crossfade
- **Category filters** — browse by Action, Puzzle, Racing, Arcade, Strategy, Adventure, Casual, Classic
- **Live search** — instant filtering by game title, description, or tags
- **Game cards** — thumbnail with hover overlay, star rating, play count, difficulty badge
- **Game modal** — screenshot carousel, YouTube video embed, full description, Play Now button
- **Dark gaming UI** — glassmorphism header, glow effects, smooth animations throughout
- **REST API** — clean JSON endpoints for all game data

---

## Quick Start

```bash
# Clone and enter the project
git clone https://github.com/ryf0224/4399_my_games.git
cd 4399_my_games

# Set up Python environment
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the server
python3 app.py
```

Open **http://localhost:8080** in your browser.

---

## Project Structure

```
4399_my_games/
├── app.py              # Flask server + API routes
├── games.json          # Mock game data (12 games)
├── requirements.txt
├── templates/
│   └── index.html      # Single-page HTML shell
└── static/
    ├── css/style.css   # Full dark gaming theme
    └── js/main.js      # UI logic (carousel, modal, search, filters)
```

---

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/games` | GET | All games. Supports `?category=Action` and `?q=search` |
| `/api/games/<id>` | GET | Single game by ID |
| `/api/featured` | GET | Featured games only |

**Example:**
```bash
curl http://localhost:8080/api/games?category=Puzzle
curl http://localhost:8080/api/games?q=space
curl http://localhost:8080/api/featured
```

---

## Mock Games

| # | Title | Category | Rating |
|---|-------|----------|--------|
| 1 | Nebula Runner | Action | ★ 4.8 |
| 2 | Puzzle Kingdom | Puzzle | ★ 4.7 |
| 3 | Turbo Drift | Racing | ★ 4.6 |
| 4 | Block Blast | Arcade | ★ 4.4 |
| 5 | Dragon Quest Z | Adventure | ★ 4.9 |
| 6 | Tower Defense X | Strategy | ★ 4.5 |
| 7 | Bubble Pop Mania | Casual | ★ 4.2 |
| 8 | Snake Pro 3D | Classic | ★ 4.3 |
| 9 | 2048 Galaxy | Puzzle | ★ 4.1 |
| 10 | Cyber Jump | Action | ★ 4.6 |
| 11 | Candy Match | Casual | ★ 3.9 |
| 12 | Space Invaders Z | Classic | ★ 4.0 |

---

## Adding Real Games

Each game in `games.json` supports an `iframe_url` field. Set it to any embeddable game URL and the Play Now button will load it directly in the modal:

```json
{
  "id": 13,
  "title": "My Game",
  "iframe_url": "https://example.com/game/embed"
}
```
