import json
import os
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GAMES_FILE = os.path.join(BASE_DIR, "games.json")


def load_games():
    with open(GAMES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/games")
def get_games():
    games = load_games()

    category = request.args.get("category", "").strip()
    query = request.args.get("q", "").strip().lower()

    if category and category.lower() != "all":
        games = [g for g in games if g["category"].lower() == category.lower()]

    if query:
        games = [
            g
            for g in games
            if query in g["title"].lower()
            or query in g["description"].lower()
            or any(query in tag.lower() for tag in g["tags"])
        ]

    return jsonify(games)


@app.route("/api/games/<int:game_id>")
def get_game(game_id):
    games = load_games()
    game = next((g for g in games if g["id"] == game_id), None)
    if game is None:
        return jsonify({"error": "Game not found"}), 404
    return jsonify(game)


@app.route("/api/featured")
def get_featured():
    games = load_games()
    featured = [g for g in games if g.get("featured", False)]
    return jsonify(featured)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host="0.0.0.0", port=port)
