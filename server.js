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
    totalEarned INTEGER DEFAULT 0,
    gift_day INTEGER DEFAULT 1,
    last_gift_date TEXT
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

app.post('/api/user/:id/claimGift', (req, res) => {
  const userId = req.params.id;

  const today = new Date().toISOString().slice(0, 10);

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.last_gift_date === today) {
      return res.status(400).json({ error: 'Gift already claimed today' });
    }

    if (user.gift_day > 30) {
      return res.status(400).json({ error: 'All gifts claimed' });
    }

    const rewardTable = [
      5,5,5, 10,10,10,
      15,15,15,
      20,20,20,
      25,25,25,
      30,30,30,
      40,40,40,
      50,50,50,
      75,75,75,
      100,100,100
    ];

    const reward = rewardTable[user.gift_day - 1];

    db.run(
      `UPDATE users
       SET balance = balance + ?,
           totalEarned = totalEarned + ?,
           gift_day = gift_day + 1,
           last_gift_date = ?
       WHERE id = ?`,
      [reward, reward, today, userId],
      () => {
        res.json({
          reward,
          gift_day: user.gift_day,
        });
      }
    );
  });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));