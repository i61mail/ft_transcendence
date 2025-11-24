

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar_url TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS pong_matches (
    id INTEGER PRIMARY key AUTOINCREMENT,
    
    game_mode TEXT NOT NULL CHECK (game_mode IN('online', 'local', 'ai')),

    left_player_id INTEGER NOT NULL,
    right_player_id INTEGER,

    winner TEXT NOT NULL CHECK (winner IN ('left', 'right')),

    left_score INTEGER NOT NULL,
    right_score INTEGER NOT NULL,

    ai_difficulty TEXT DEFAULT NULL,

    FOREIGN KEY(left_player_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(right_player_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tic_tac_toe_matches (
    id INTEGER PRIMARY key AUTOINCREMENT,

    x_player_id INTEGER NOT NULL,
    o_player_id INTEGER NOT NULL,

    winner TEXT NOT NULL CHECK (winner IN ('x', 'o', 'draw')),

    FOREIGN KEY(x_player_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(o_player_id) REFERENCES users(id) ON DELETE SET NULL
);



1 M
4 m