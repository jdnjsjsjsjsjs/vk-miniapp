const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(path.join(__dirname, 'uploads'));
ensureDir(path.join(__dirname, 'uploads', 'shop'));
ensureDir(path.join(__dirname, 'uploads', 'task-answers'));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Подключение базы данных (создаст файл users.db, если его нет)
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Подключено к базе SQLite.');
});

db.run('PRAGMA foreign_keys = ON');

// Функция записи транзакции
function addTransaction(userId, type, amount, description = '') {
  db.run(
    `INSERT INTO transactions (user_id, type, amount, description)
     VALUES (?, ?, ?, ?)`,
    [userId, type, amount, description]
  );
}

function calculateAchievements(user) {
  let count = 0;

  if (user.totalEarned >= 5000) count++;
  if (user.totalEarned >= 10000) count++;
  if (user.max_streak_days > 10) count++;
  if (user.received_count > 10) count++;
  if (user.vk_subscribed >= 1) count++;

  return count;
}

function updateLoginStreak(user) {
  const today = new Date().toISOString().slice(0, 10);

  if (!user.last_login_date) {
    return {
      streak: 1,
      maxStreak: 1,
      lastLogin: today
    };
  }

  const last = new Date(user.last_login_date);
  const now = new Date(today);

  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  let newStreak;
  let maxStreak = user.max_streak_days || 0;

  if (diffDays === 1) {
    newStreak = user.streak_days + 1;
  } else if (diffDays === 0) {
    newStreak = user.streak_days;
  } else {
    newStreak = 1;
  }

  if (newStreak > maxStreak) {
    maxStreak = newStreak;
  }

  return {
    streak: newStreak,
    maxStreak,
    lastLogin: today
  };
}

function updateReceivedCount(userId) {
  db.get(
    `SELECT COUNT(*) as count FROM user_items WHERE user_id = ? AND received = 1`,
    [userId],
    (err, row) => {
      if (err) return console.error(err.message);
      const receivedCount = row.count;
      db.run(
        `UPDATE users SET received_count = ? WHERE id = ?`,
        [receivedCount, userId],
        err => {
          if (err) console.error(err.message);
        }
      );
    }
  );
}

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.match(/image\/(jpeg|png)/)) {
      return cb(new Error('Только jpg и png'));
    }
    cb(null, true);
  },
});

const answerUpload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const allowed = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Разрешены только jpg, png, pdf'));
    }

    cb(null, true);
  }
});

// Создаем таблицу пользователей, если её нет
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    balance INTEGER DEFAULT 0,
    totalEarned INTEGER DEFAULT 0,
    totalSpent INTEGER DEFAULT 0,
    achievementCount INTEGER DEFAULT 0,
    gift_day INTEGER DEFAULT 1,
    last_gift_date TEXT,
    role TEXT DEFAULT 'user',

    streak_days INTEGER DEFAULT 0,
    max_streak_days INTEGER DEFAULT 0,
    last_login_date TEXT,
    received_count INTEGER DEFAULT 0,
    vk_subscribed INTEGER DEFAULT 0
  )
`);

// Таблица транзакций
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,              -- income | expense
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Даём админку нужному пользователю
const adminId = 382210259;
db.run(`
  INSERT INTO users (id, role)
  VALUES (?, 'admin')
  ON CONFLICT(id) DO UPDATE SET role = 'admin'
`, [adminId], (err) => {
  if (err) return console.error('Ошибка при присвоении админки:', err.message);
  console.log(`Пользователь ${adminId} назначен admin`);
});

const adminId1 = 170532879;
db.run(`
  INSERT INTO users (id, role)
  VALUES (?, 'admin')
  ON CONFLICT(id) DO UPDATE SET role = 'user'
`, [adminId1], (err) => {
  if (err) return console.error('Ошибка при присвоении админки:', err.message);
  console.log(`Пользователь ${adminId1} назначен user`);
});

const adminId2 = 136685474;
db.run(`
  INSERT INTO users (id, role)
  VALUES (?, 'admin')
  ON CONFLICT(id) DO UPDATE SET role = 'admin'
`, [adminId2], (err) => {
  if (err) return console.error('Ошибка при присвоении админки:', err.message);
  console.log(`Пользователь ${adminId2} назначен admin`);
});

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    reward INTEGER NOT NULL,
    expires_at TEXT,
    require_file INTEGER DEFAULT 0,
    archive INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', '+3 hours'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS task_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    answer TEXT,
    file_paths TEXT,
    status TEXT DEFAULT 'pending',
    was_rejected INTEGER DEFAULT 0,
    admin_comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    price INTEGER NOT NULL,
    image TEXT,
    archived INTEGER DEFAULT 0
  )
`);

db.run(`
  ALTER TABLE shop_items
  ADD COLUMN quantity INTEGER DEFAULT 0
`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error(err.message);
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS user_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    received INTEGER DEFAULT 0,
    price_at_purchase INTEGER,
    purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
  )
`);

// Корзина пользователя
db.run(`
  CREATE TABLE IF NOT EXISTS cart_items (
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
  )
`);

// Получить данные пользователя
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;

  console.log("🔥 /api/user HIT");
  console.log("➡️ params:", req.params);
  console.log("➡️ userId raw:", req.params.id, typeof req.params.id);

  db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!row) {
      console.log("💾 INSERT TRIGGERED for:", userId);
      const today = new Date().toISOString().slice(0, 10);
      db.run(
        `INSERT INTO users 
        (id, first_name, last_name, balance, totalEarned, totalSpent, streak_days, last_login_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, '', '', 0, 0, 0, 1, today],
        async function(err) { // 🔹 async тут
          if (err) return res.status(500).json({ error: err.message });

          // проверка подписки сразу для нового пользователя
          let vk_subscribed = 0;
          try {
            vk_subscribed = await updateVKSubscriptionStatus(userId);
          } catch (e) {}

          res.json({
            id: userId,
            first_name: '',
            last_name: '',
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            role: 'user',
            streak_days: 1,
            last_login_date: today,
            vk_subscribed
          });
        }
      );
    } else {
      console.log("♻️ USER EXISTS:", userId);
      const result = updateLoginStreak(row);
      db.run(
        `UPDATE users
        SET streak_days = ?, max_streak_days = ?, last_login_date = ?
        WHERE id = ?`,
        [result.streak, result.maxStreak, result.lastLogin, userId]
      );

      row.streak_days = result.streak;
      row.max_streak_days = result.maxStreak;
      row.last_login_date = result.lastLogin;

      let vk_subscribed = 0;
      try {
        vk_subscribed = await updateVKSubscriptionStatus(userId);
      } catch (e) {}

      row.vk_subscribed = vk_subscribed;
      
      const newAchievementCount = calculateAchievements({
        totalEarned: row.totalEarned,
        max_streak_days: row.max_streak_days,
        received_count: row.received_count,
        vk_subscribed: vk_subscribed
      });

      if (newAchievementCount !== row.achievementCount) {
        db.run(
          'UPDATE users SET achievementCount = ? WHERE id = ?',
          [newAchievementCount, userId]
        );
        row.achievementCount = newAchievementCount;
      }

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
    const achievementCount = calculateAchievements({
      totalEarned: newTotal,
      max_streak_days: row.max_streak_days,
      received_count: row.received_count,
      vk_subscribed: row.vk_subscribed
    });

    db.run('UPDATE users SET balance = ?, totalEarned = ?, achievementCount = ? WHERE id = ?',
            [newBalance, newTotal, achievementCount, userId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      addTransaction(userId, 'income', amount, 'Пополнение баланса');
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
      1,1,1,1,2,
      2,2,2,2,3,
      3,3,3,3,4,
      4,4,4,4,5,
      5,5,5,5,6,
      6,6,6,6,7,
    ];

    const reward = rewardTable[user.gift_day - 1];

    const newTotal = user.totalEarned + reward;
    const achievementCount = calculateAchievements({
      totalEarned: newTotal,
      max_streak_days: user.max_streak_days,
      received_count: user.received_count,
      vk_subscribed: user.vk_subscribed
    });

    db.run(
      `UPDATE users
        SET balance = balance + ?,
            totalEarned = ?,
            achievementCount = ?,
            gift_day = gift_day + 1,
            last_gift_date = ?
       WHERE id = ?`,
      [reward, newTotal, achievementCount, today, userId],
      () => {
        addTransaction(userId, 'income', reward, 'Ежедневный бонус');
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
      t.question,
      t.reward,
      t.expires_at,
      t.require_file,
      a.status
    FROM tasks t
    LEFT JOIN task_answers a 
      ON a.task_id = t.id AND a.user_id = ?
    WHERE t.expires_at IS NULL 
      OR t.expires_at > datetime('now', '+3 hours')
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
      was_rejected = task_answers.was_rejected,
      created_at = CURRENT_TIMESTAMP
    `,
    [taskId, userId, answer],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.post(
  '/api/tasks/:taskId/answer-with-file',
  answerUpload.array('files', 5),
  async (req, res) => {
    const taskId = req.params.taskId;
    const { userId, answer } = req.body;

    db.get('SELECT * FROM tasks WHERE id = ?', [taskId], async (err, task) => {
      db.get(
        'SELECT file_paths FROM task_answers WHERE task_id = ? AND user_id = ?',
        [taskId, userId],
        async (err, oldAnswer) => {

          if (oldAnswer && oldAnswer.file_paths) {
            try {
              const paths = JSON.parse(oldAnswer.file_paths);

              for (const p of paths) {
                const fullPath = path.resolve(__dirname, '.' + p);
                if (fs.existsSync(fullPath)) {
                  fs.unlinkSync(fullPath);
                }
              }
            } catch (e) {}
          }
          if (!task) return res.status(404).json({ error: 'Task not found' });

          let filePaths = [];

          if (task.require_file) {
            if (!req.files || req.files.length === 0) {
              return res.status(400).json({ error: 'File required' });
            }

            for (const file of req.files) {
              const ext = path.extname(file.originalname);
              const baseName = path
                .basename(file.originalname, ext)
                .replace(/[^a-zA-Z0-9]/g, '_')
                .slice(0, 15);

              const fileName = `${baseName}_${Date.now()}${ext}`;
              const outputPath = path.join(__dirname, 'uploads', 'task-answers', fileName);

              await fs.promises.writeFile(outputPath, file.buffer);

              filePaths.push(`/uploads/task-answers/${fileName}`);
            }
          }

          db.run(
            `
            INSERT INTO task_answers (task_id, user_id, answer, file_paths, status)
            VALUES (?, ?, ?, ?, 'pending')
            ON CONFLICT(task_id, user_id)
            DO UPDATE SET
              answer = excluded.answer,
              file_paths = excluded.file_paths,
              status = 'pending',
              created_at = CURRENT_TIMESTAMP
            `,
            [taskId, userId, answer || '', JSON.stringify(filePaths)],
            function (err) {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ success: true });
            }
          );
        }
      );
    });
  }
);

// Проверка роли пользователя
app.get('/api/admin/tasks', (req, res) => {
  const { userId } = req.query;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.all(`
      SELECT
        t.*,
        COUNT(
          CASE WHEN a.status = 'pending' THEN 1 END
        ) AS pendingCount
      FROM tasks t
      LEFT JOIN task_answers a
        ON a.task_id = t.id
      WHERE 
        (
          t.archive = 0 
          OR t.archive IS NULL
          OR (
            t.archive = 1 
            AND (t.expires_at IS NULL OR t.expires_at > datetime('now', '+3 hours'))
          )
        )
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

// Для админа - создать задание
app.post('/api/admin/tasks', (req, res) => {
  const { userId, title, question, reward, expires_at, require_file, archive } = req.body;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `INSERT INTO tasks (title, question, reward, expires_at, require_file, archive)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, question, reward, expires_at || null, require_file || 0, archive || 0],
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
        a.file_paths,
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
  const { userId, action, comment } = req.body;
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
        `UPDATE task_answers 
        SET status = ?, 
            was_rejected = ?, 
            admin_comment = ?
        WHERE id = ?`,
        [
          newStatus,
          newStatus === 'rejected' ? 1 : answer.was_rejected,
          action === 'reject' ? (comment || '') : null,
          answerId
        ],
        () => {

          if (answer.file_paths) {
            try {
              const paths = JSON.parse(answer.file_paths);

              for (const p of paths) {
                const fullPath = path.resolve(__dirname, '.' + p);
                if (fs.existsSync(fullPath)) {
                  fs.unlinkSync(fullPath);
                }
              }
            } catch (e) {}
          }

          if (newStatus === 'accepted') {
            db.get('SELECT totalEarned FROM users WHERE id = ?', [answer.user_id], (err, userRow) => {
              const newTotal = userRow.totalEarned + answer.reward;
              const achievementCount = calculateAchievements({
                totalEarned: newTotal,
                max_streak_days: userRow.max_streak_days,
                received_count: userRow.received_count,
                vk_subscribed: userRow.vk_subscribed
              });

              db.run(`
                UPDATE users
                SET balance = balance + ?,
                    totalEarned = ?,
                    achievementCount = ?
                WHERE id = ?
              `, [answer.reward, newTotal, achievementCount, answer.user_id]);
            });

            addTransaction(answer.user_id, 'income', answer.reward, 'Награда за задание');
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

// Получить товары магазина + купленные предметы пользователя
app.get('/api/shop', (req, res) => {
  const { userId } = req.query;

  db.all('SELECT * FROM shop_items WHERE quantity > 0', (err, items) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!userId) {
      return res.json({ items, ownedItems: [] });
    }

    db.all(
      'SELECT item_id, received FROM user_items WHERE user_id = ?',
      [userId],
      (err, rows) => {
        res.json({ items, ownedItems: rows });
      }
    )
  });
});

// Купить товар
app.post('/api/shop/buy/:itemId', (req, res) => {
  const { userId } = req.body;
  const itemId = req.params.itemId;

  const orderId = Date.now();

  db.run(
    `INSERT INTO user_items (user_id, item_id, order_id, received)
     VALUES (?, ?, ?, 0)`,
    [userId, itemId, orderId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, purchaseId: this.lastID });
    }
  );
});

// Админ — получить все товары магазина
app.get('/api/admin/shop', (req, res) => {
  const { userId } = req.query;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.all('SELECT * FROM shop_items ORDER BY id DESC', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

// Админ — добавить товар
app.post('/api/admin/shop', (req, res) => {
  const { userId, title, quantity, price, image } = req.body;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `INSERT INTO shop_items (title, quantity, price, image)
       VALUES (?, ?, ?, ?)`,
      [title, quantity, price, image],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

// Админ — редактировать товар
app.put('/api/admin/shop/:id', (req, res) => {
  const { userId, title, quantity, price, image } = req.body;
  const itemId = req.params.id;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `UPDATE shop_items
       SET title = ?, quantity = ?, price = ?, image = ?
       WHERE id = ?`,
      [title, quantity, price, image, itemId],
      err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });
});

// Админ — удалить товар
app.delete('/api/admin/shop/:id', (req, res) => {
  const { userId } = req.body;
  const itemId = req.params.id;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run('DELETE FROM shop_items WHERE id = ?', [itemId], err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// Загрузка картинки
app.post(
  '/api/admin/upload/shop-image',
  upload.single('image'),
  async (req, res) => {
    try {
      const { userId } = req.body;

      // проверка админа
      db.get('SELECT role FROM users WHERE id = ?', [userId], async (err, user) => {
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden' });
        }

        const fileName = `shop_${Date.now()}.jpg`;
        const outputPath = path.join(__dirname, 'uploads', 'shop', fileName);

        // обрезка + квадрат
        await sharp(req.file.buffer)
          .resize(512, 512, {
            fit: 'cover',
            position: 'centre',
          })
          .jpeg({ quality: 90 })
          .toFile(outputPath);

        res.json({
          imagePath: `/uploads/shop/${fileName}`,
        });
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Ошибка загрузки изображения' });
    }
  }
);

// Удаление картинки
app.post('/api/admin/delete-temp-image', (req, res) => {
  const { imagePath, userId } = req.body;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!imagePath) {
      return res.json({ success: true });
    }

    const fullPath = path.join(__dirname, imagePath);

    fs.unlink(fullPath, err => {
      if (err) {
        console.warn('Не удалось удалить файл:', fullPath);
        return res.json({ success: false });
      }
      res.json({ success: true });
    });
  });
});

// Для админа - редактировать задание
app.put('/api/admin/tasks/:id', (req, res) => {
  const { userId, title, question, reward, expires_at, require_file, archive } = req.body;
  const taskId = req.params.id;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `UPDATE tasks
       SET title = ?, question = ?, reward = ?, expires_at = ?, require_file = ?, archive = ?
       WHERE id = ?`,
      [title, question, reward, expires_at || null, require_file || 0, archive || 0, taskId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });
});

// Для админа - удалить задание
app.delete('/api/admin/tasks/:id', (req, res) => {
  const { userId } = req.body;
  const taskId = req.params.id;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 1. Получаем все файлы задания
    db.all(
      'SELECT file_paths FROM task_answers WHERE task_id = ?',
      [taskId],
      (err, answers) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. Удаляем файлы
        answers.forEach(a => {
          if (a.file_paths) {
            const fullPath = path.join(__dirname, a.file_paths);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        });

        // 3. Удаляем ответы
        db.run('DELETE FROM task_answers WHERE task_id = ?', [taskId], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // 4. Удаляем само задание
          db.run('DELETE FROM tasks WHERE id = ?', [taskId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
          });
        });
      }
    );
  });
});

// GET корзины
app.get('/api/cart/:userId', (req, res) => {
  const userId = req.params.userId;

  db.all(`
    SELECT c.item_id, c.quantity, s.title, s.price, s.image
    FROM cart_items c
    JOIN shop_items s ON s.id = c.item_id
    WHERE c.user_id = ?
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ cart: rows });
  });
});

// POST добавить в корзину
app.post('/api/cart/add', (req, res) => {
  const { userId, itemId, quantity = 1 } = req.body;

  // проверка товара
  db.get('SELECT * FROM shop_items WHERE id = ?', [itemId], (err, item) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // проверка, есть ли уже в корзине
    db.get('SELECT * FROM cart_items WHERE user_id = ? AND item_id = ?', [userId, itemId], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        // обновляем количество
        const newQuantity = row.quantity + quantity;
        db.run('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND item_id = ?', [newQuantity, userId, itemId], () => {
          res.json({ success: true, itemId, quantity: newQuantity });
        });
      } else {
        // добавляем новый
        db.run('INSERT INTO cart_items (user_id, item_id, quantity) VALUES (?, ?, ?)', [userId, itemId, quantity], () => {
          res.json({ success: true, itemId, quantity });
        });
      }
    });
  });
});

// POST уменьшить количество в корзине
app.post('/api/cart/decrease', (req, res) => {
  const { userId, itemId } = req.body;

  db.get(
    'SELECT quantity FROM cart_items WHERE user_id = ? AND item_id = ?',
    [userId, itemId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Item not in cart' });

      if (row.quantity <= 1) {
        db.run(
          'DELETE FROM cart_items WHERE user_id = ? AND item_id = ?',
          [userId, itemId],
          () => res.json({ success: true, itemId, quantity: 0 })
        );
      } else {
        const newQty = row.quantity - 1;
        db.run(
          'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND item_id = ?',
          [newQty, userId, itemId],
          () => res.json({ success: true, itemId, quantity: newQty })
        );
      }
    }
  );
});

// POST удалить из корзины
app.post('/api/cart/remove', (req, res) => {
  const { userId, itemId } = req.body;

  db.run('DELETE FROM cart_items WHERE user_id = ? AND item_id = ?', [userId, itemId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, itemId });
  });
});

// POST очистить корзину
app.post('/api/cart/clear', (req, res) => {
  const { userId } = req.body;

  db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// POST оформить покупку
app.post('/api/cart/checkout', (req, res) => {
  const { userId } = req.body;

  db.all(`
    SELECT c.item_id, c.quantity, s.price, s.quantity as stock
    FROM cart_items c
    JOIN shop_items s ON s.id = c.item_id
    WHERE c.user_id = ?
  `, [userId], (err, cartItems) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          error: `Недостаточно товара на складе`
        });
      }
    }

    // получаем баланс пользователя
    db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (user.balance < totalPrice) return res.status(400).json({ error: 'Insufficient balance' });

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const orderId = Date.now();
        let totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (user.balance < totalPrice) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'Insufficient balance' });
        }

        cartItems.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
            db.run(`
              INSERT INTO user_items (user_id, item_id, order_id, received, price_at_purchase)
              VALUES (?, ?, ?, 0, ?)
            `, [userId, item.item_id, orderId, item.price]);
          }

          db.run(`
            UPDATE shop_items
            SET quantity = quantity - ?
            WHERE id = ?
          `, [item.quantity, item.item_id]);
        });

        db.run('UPDATE users SET balance = balance - ?, totalSpent = totalSpent + ? WHERE id = ?', [totalPrice, totalPrice, userId]);
        db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);
        addTransaction(userId, 'expense', totalPrice, 'Покупка в магазине');  
        db.run('COMMIT', () => res.json({ success: true }));
      });
    });
  });
});

// Получить историю транзакций пользователя
app.get('/api/user/:id/transactions', (req, res) => {
  const userId = req.params.id;

  db.all(
    `SELECT id, type, amount, description, created_at
     FROM transactions
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Админ — получить все покупки
app.get('/api/admin/purchases', (req, res) => {
  const { userId } = req.query;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.all(`
      SELECT 
        ui.id,
        ui.order_id,
        u.id as user_id,
        u.first_name,
        u.last_name,
        s.title,
        s.image,
        s.price,
        ui.item_id,
        ui.received,
        ui.purchased_at
      FROM user_items ui
      JOIN users u ON u.id = ui.user_id
      JOIN shop_items s ON s.id = ui.item_id
      ORDER BY ui.purchased_at DESC
    `, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

app.post('/api/admin/purchases/mark-received', (req, res) => {
  const { userId, orderId } = req.body;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, admin) => {
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      'UPDATE user_items SET received = 1 WHERE order_id = ?',
      [orderId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.all(`SELECT DISTINCT user_id FROM user_items WHERE order_id = ?`, [orderId], (err, rows) => {
          if (!err) {
            rows.forEach(row => updateReceivedCount(row.user_id));
          }
        });

        res.json({ success: true });
      }
    );
  });
});

app.get('/api/user/:id/purchases', (req, res) => {
  const userId = req.params.id;

  db.all(`
    SELECT ui.id,
           ui.item_id,
           ui.received,
           ui.purchased_at,
           ui.order_id,
           s.title,
           s.image
    FROM user_items ui
    JOIN shop_items s ON s.id = ui.item_id
    WHERE ui.user_id = ?
    ORDER BY ui.purchased_at DESC
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const axios = require('axios');

async function updateVKSubscriptionStatus(userId) {
  const groupId = "here's your ID";
  const accessToken = "here's your key";

  try {
    const res = await axios.get('https://api.vk.com/method/groups.isMember', {
      params: {
        group_id: groupId,
        user_id: userId,
        access_token: accessToken,
        v: '5.131'
      }
    });

    const subscribed = res.data.response ? 1 : 0;

    db.run(
      'UPDATE users SET vk_subscribed = ? WHERE id = ?',
      [subscribed, userId],
      (err) => {
        if (err) console.error('Ошибка при обновлении подписки:', err.message);
      }
    );

    return subscribed;
  } catch (e) {
    console.error('Ошибка VK API:', e.message);
    return 0;
  }
}

app.get('/api/admin/tasks/archive', (req, res) => {
  const { userId } = req.query;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.all(`
      SELECT *
      FROM tasks
      WHERE archive = 1
        AND expires_at IS NOT NULL
        AND datetime(substr(expires_at,1,19)) <= datetime('now', '+3 hours')
      ORDER BY created_at DESC
    `, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

app.get('/api/admin/answers-feed', (req, res) => {
  const { userId } = req.query;

  // проверка админа
  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // основной запрос
    db.all(`
      SELECT
        a.id,
        a.answer,
        a.status,
        a.user_id,
        a.file_paths,
        a.created_at,
        a.was_rejected,
        a.admin_comment,
        u.first_name,
        u.last_name,
        t.title as task_title
      FROM task_answers a
      JOIN users u ON u.id = a.user_id
      JOIN tasks t ON t.id = a.task_id
      ORDER BY a.created_at DESC
    `, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(rows);
    });
  });
});

app.get('/api/tasks/:taskId/my-answer/:userId', (req, res) => {
  const { taskId, userId } = req.params;

  db.get(
    `SELECT status, admin_comment, was_rejected
     FROM task_answers
     WHERE task_id = ? AND user_id = ?`,
    [taskId, userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || null);
    }
  );
});

// Админ — архивировать / разархивировать товар
app.post('/api/admin/shop/:id/archive', (req, res) => {
  const { userId, archived } = req.body;
  const itemId = req.params.id;

  // проверка админа
  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `UPDATE shop_items
       SET archived = ?
       WHERE id = ?`,
      [archived ? 1 : 0, itemId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          success: true,
          itemId,
          archived: archived ? 1 : 0
        });
      }
    );
  });
});

app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));