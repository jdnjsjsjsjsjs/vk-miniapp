const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

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

const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.match(/image\/(jpeg|png)/)) {
      cb(new Error('Только jpg и png'));
    }
    cb(null, true);
  },
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

// Даём админку нужному пользователю
const adminId = 382210259;

db.run(`
  INSERT INTO users (id, role)
  VALUES (?, 'admin')
  ON CONFLICT(id) DO UPDATE SET role = 'user'
`, [adminId], (err) => {
  if (err) return console.error('Ошибка при присвоении админки:', err.message);
  console.log(`Пользователь ${adminId} назначен user`);
});

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

// Товары магазина
db.run(`
  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS user_items (
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, item_id)
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
      t.question,
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

    db.all(`
      SELECT
        t.*,
        COUNT(
          CASE WHEN a.status = 'pending' THEN 1 END
        ) AS pendingCount
      FROM tasks t
      LEFT JOIN task_answers a
        ON a.task_id = t.id
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

// Получить товары магазина + купленные предметы пользователя
app.get('/api/shop', (req, res) => {
  const { userId } = req.query;

  db.all('SELECT * FROM shop_items', (err, items) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!userId) {
      return res.json({ items, ownedItems: [] });
    }

    db.all(
      'SELECT item_id FROM user_items WHERE user_id = ?',
      [userId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const ownedItems = rows.map(r => r.item_id);
        res.json({ items, ownedItems });
      }
    );
  });
});

// Купить товар
app.post('/api/shop/buy/:itemId', (req, res) => {
  const { userId } = req.body;
  const itemId = req.params.itemId;

  db.get(
    'SELECT * FROM user_items WHERE user_id = ? AND item_id = ?',
    [userId, itemId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        // Увеличиваем количество
        const newQty = row.quantity + 1;
        db.run(
          'UPDATE user_items SET quantity = ? WHERE user_id = ? AND item_id = ?',
          [newQty, userId, itemId],
          () => res.json({ success: true, itemId, quantity: newQty })
        );
      } else {
        db.run(
          'INSERT INTO user_items (user_id, item_id, quantity) VALUES (?, ?, 1)',
          [userId, itemId],
          () => res.json({ success: true, itemId, quantity: 1 })
        );
      }
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
  const { userId, title, description, price, image } = req.body;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `INSERT INTO shop_items (title, description, price, image)
       VALUES (?, ?, ?, ?)`,
      [title, description, price, image],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

// Админ — редактировать товар
app.put('/api/admin/shop/:id', (req, res) => {
  const { userId, title, description, price, image } = req.body;
  const itemId = req.params.id;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `UPDATE shop_items
       SET title = ?, description = ?, price = ?, image = ?
       WHERE id = ?`,
      [title, description, price, image, itemId],
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
  const { userId, title, question, reward, expires_at } = req.body;
  const taskId = req.params.id;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run(
      `UPDATE tasks
       SET title = ?, question = ?, reward = ?, expires_at = ?
       WHERE id = ?`,
      [title, question, reward, expires_at || null, taskId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });
});

// Для админа - удалить задание
app.delete('/api/admin/tasks/:id', (req, res) => {
  const { userId } = req.body; // userId приходит в body
  const taskId = req.params.id;

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    db.run('DELETE FROM tasks WHERE id = ?', [taskId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
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
    SELECT c.item_id, c.quantity, s.price
    FROM cart_items c
    JOIN shop_items s ON s.id = c.item_id
    WHERE c.user_id = ?
  `, [userId], (err, cartItems) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    // получаем баланс пользователя
    db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (user.balance < totalPrice) return res.status(400).json({ error: 'Insufficient balance' });

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        let totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (user.balance < totalPrice) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'Insufficient balance' });
        }

        cartItems.forEach(item => {
          db.run(`
            INSERT INTO user_items (user_id, item_id, quantity)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, item_id)
            DO UPDATE SET quantity = quantity + excluded.quantity
          `, [userId, item.item_id, item.quantity]);
        });

        db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [totalPrice, userId]);
        db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);
        db.run('COMMIT', () => res.json({ success: true }));
      });
    });
  });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));