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
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    balance INTEGER DEFAULT 0,
    totalEarned INTEGER DEFAULT 0,
    gift_day INTEGER DEFAULT 1,
    last_gift_date TEXT,
    role TEXT DEFAULT 'user'
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    reward INTEGER NOT NULL,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// ===== ДОБАВЛЯЕМ ТЕСТОВЫЕ ЗАДАНИЯ, НАДО УДАЛИТЬ ПОТОМ =====
db.get(`SELECT COUNT(*) as count FROM tasks`, (err, row) => {
  if (err) {
    console.error('Ошибка проверки tasks:', err.message);
    return;
  }

  if (row.count === 0) {
    console.log('tasks пустая — добавляем тестовые задания');

    const seedTasks = [
      {
        title: 'Простое задание',
        question: 'Напиши любое слово',
        reward: 5,
      },
      {
        title: 'Среднее задание',
        question: 'Почему небо голубое?',
        reward: 10,
      },
      {
        title: 'Сложное задание',
        question: 'Опиши, как работает VK Mini Apps',
        reward: 20,
      },
    ];

    const stmt = db.prepare(`
      INSERT INTO tasks (title, question, reward)
      VALUES (?, ?, ?)
    `);

    seedTasks.forEach(task => {
      stmt.run(task.title, task.question, task.reward);
    });

    stmt.finalize(() => {
      console.log('Тестовые задания добавлены');
    });
  } else {
    console.log('tasks уже содержит данные — сид пропущен');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS task_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(task_id, user_id)
  )
`);

// Получить данные пользователя
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      db.run(
        'INSERT INTO users (id, first_name, last_name, balance, totalEarned) VALUES (?, ?, ?, ?, ?)',
        [userId, '', '', 0, 0],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: userId, first_name: '', last_name: '', balance: 0, totalEarned: 0, role: 'user' });
        }
      );
    } else {
      res.json(row);
    }
  });
});

// Обновить имя/фамилию
app.post('/api/user/:id/updateName', (req, res) => {
  const userId = req.params.id;
  const { first_name = '', last_name = '' } = req.body;

  db.run(
    'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
    [first_name, last_name, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: userId, first_name, last_name });
    }
  );
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

// Забрать ежедневный подарок
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

// Рейтинг
app.get('/api/users', (req, res) => {
  db.all('SELECT id, first_name, last_name, totalEarned FROM users ORDER BY totalEarned DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Получить список заданий для роли пользователя
app.get('/api/tasks/:userId', (req, res) => {
  const userId = req.params.userId;

  db.all(`
    SELECT 
      t.id,
      t.title,
      t.reward,
      t.expires_at,
      a.status
    FROM tasks t
    LEFT JOIN task_answers a 
      ON a.task_id = t.id AND a.user_id = ?
    WHERE t.expires_at IS NULL 
       OR t.expires_at > datetime('now')
    ORDER BY t.created_at DESC
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Отправить ответ на задание
app.post('/api/tasks/:taskId/answer', (req, res) => {
  const taskId = req.params.taskId;
  const { userId, answer } = req.body;

  db.run(
    `
    INSERT INTO task_answers (task_id, user_id, answer, status)
    VALUES (?, ?, ?, 'pending')
    ON CONFLICT(task_id, user_id)
    DO UPDATE SET
      answer = excluded.answer,
      status = 'pending',
      created_at = CURRENT_TIMESTAMP
    `,
    [taskId, userId, answer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Проверка роли пользователя
app.get('/api/admin/tasks', (req, res) => {
  const { userId } = req.query;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

// Для админа - создать задание
app.post('/api/admin/tasks', (req, res) => {
  const { userId, title, question, reward, expires_at } = req.body;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `INSERT INTO tasks (title, question, reward, expires_at)
       VALUES (?, ?, ?, ?)`,
      [title, question, reward, expires_at || null],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

//Для админа - получить ответы на задание
app.get('/api/admin/tasks/:taskId/answers', (req, res) => {
  const { userId } = req.query;
  const taskId = req.params.taskId;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.all(`
      SELECT 
        a.id,
        a.answer,
        a.status,
        a.user_id,
        u.first_name,
        u.last_name
      FROM task_answers a
      JOIN users u ON u.id = a.user_id
      WHERE a.task_id = ?
      ORDER BY a.created_at DESC
    `, [taskId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

//Для админа - принять/отклонить ответ
app.post('/api/admin/answers/:answerId', (req, res) => {
  const { userId, action } = req.body; // action = 'accept' | 'reject'
  const answerId = req.params.answerId;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, admin) => {
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.get(`
      SELECT a.*, t.reward
      FROM task_answers a
      JOIN tasks t ON t.id = a.task_id
      WHERE a.id = ?
    `, [answerId], (err, answer) => {
      if (!answer) return res.status(404).json({ error: 'Answer not found' });

      if (answer.status === 'accepted') {
        return res.json({ success: true });
      }

      const newStatus = action === 'accept' ? 'accepted' : 'rejected';

      db.run(
        'UPDATE task_answers SET status = ? WHERE id = ?',
        [newStatus, answerId],
        () => {
          if (newStatus === 'accepted') {
            db.run(`
              UPDATE users
              SET balance = balance + ?,
                  totalEarned = totalEarned + ?
              WHERE id = ?
            `, [answer.reward, answer.reward, answer.user_id]);
          }

          res.json({ success: true });
        }
      );
    });
  });
});

// Получить одно задание для модального окна
app.get('/api/tasks/task/:id', (req, res) => {
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Task not found' });
    res.json(row);
  });
});

// СОЗДАНИЕ ТЕСТОВЫХ ЮЗЕРОВ
app.get('/api/createTestUsers', (req, res) => {
  const testUsers = [
    { id: 103, first_name: 'Сергей', last_name: 'Сергеев', totalEarned: 3 },
    { id: 104, first_name: 'Анна', last_name: 'Ананьева', totalEarned: 15 },
    { id: 105, first_name: 'Мария', last_name: 'Миронова', totalEarned: 20 },
  ];

  let completed = 0;

  testUsers.forEach(u => {
    db.get('SELECT * FROM users WHERE id = ?', [u.id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        db.run(
          'INSERT INTO users (id, balance, totalEarned, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
          [u.id, 0, u.totalEarned, u.first_name, u.last_name],
          () => {
            completed++;
            if (completed === testUsers.length) res.json({ message: 'Test users added!' });
          }
        );
      } else {
        completed++;
        if (completed === testUsers.length) res.json({ message: 'Test users added!' });
      }
    });
  });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));