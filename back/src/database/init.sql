CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT,
  avatar_url TEXT DEFAULT NULL,
  google_id TEXT UNIQUE DEFAULT NULL,
  auth_provider TEXT DEFAULT 'local',
  display_name TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  friendship_id INTEGER NOT NULL,
  sender INTEGER NOT NULL,
  receiver INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_blocked BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  blocker_id INTEGER NOT NULL,
  blocked_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS pong_matches (
    id INTEGER PRIMARY key AUTOINCREMENT,
    
    game_mode TEXT NOT NULL, -- CHECK (game_mode IN('online', 'local', 'ai')),

    left_player_id INTEGER NOT NULL,
    right_player_id INTEGER,

    winner TEXT NOT NULL, -- CHECK (winner IN ('left', 'right')),

    left_score INTEGER NOT NULL,
    right_score INTEGER NOT NULL,

    ai_difficulty TEXT DEFAULT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(left_player_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(right_player_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tic_tac_toe_matches (
    id INTEGER PRIMARY key AUTOINCREMENT,

    x_player_id INTEGER NOT NULL,
    o_player_id INTEGER NOT NULL,

    winner TEXT NOT NULL CHECK (winner IN ('x', 'o', 'draw')),
  
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(x_player_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(o_player_id) REFERENCES users(id) ON DELETE SET NULL
);