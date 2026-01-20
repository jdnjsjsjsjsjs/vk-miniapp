const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Подключение базы данных (создаст файл users.db, если его нет)
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Подключено к базе SQLite.');
});

// Создаем таблицу пользователей, если её нет
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    balance INTEGER DEFAULT 0,
    totalEarned INTEGER DEFAULT 0
  )
`);

// Получить данные пользователя
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      // Если пользователя нет — создаем
      db.run('INSERT INTO users (id, balance, totalEarned) VALUES (?, ?, ?)', [userId, 0, 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: userId, balance: 0, totalEarned: 0 });
      });
    } else {
      res.json(row);
    }
  });
});

// Добавить награду / пополнить баланс
app.post('/api/user/:id/addBalance', (req, res) => {
  const userId = req.params.id;
  const { amount } = req.body;

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) return res.status(404).json({ error: 'User not found' });

    const newBalance = row.balance + amount;
    const newTotal = row.totalEarned + amount;

    db.run('UPDATE users SET balance = ?, totalEarned = ? WHERE id = ?', [newBalance, newTotal, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: userId, balance: newBalance, totalEarned: newTotal });
    });
  });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));