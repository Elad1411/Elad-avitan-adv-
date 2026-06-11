const { DatabaseSync } = require('node:sqlite')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const DATA_DIR = './data'
const DB_PATH = path.join(DATA_DIR, 'law.db')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')

;[DATA_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Created: ${dir}`)
  }
})

if (!fs.existsSync('.env.local')) {
  const secret = crypto.randomBytes(32).toString('hex')
  fs.writeFileSync('.env.local', `NEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=${secret}\nDATABASE_PATH=./data/law.db\nUPLOAD_DIR=./data/uploads\n`)
  console.log('Created .env.local with secure NEXTAUTH_SECRET')
}

const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    case_number TEXT,
    title TEXT NOT NULL,
    description TEXT,
    area TEXT DEFAULT 'criminal',
    status TEXT DEFAULT 'פתוח',
    court TEXT,
    judge TEXT,
    next_hearing TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS case_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id)
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER,
    user_id INTEGER NOT NULL,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by TEXT DEFAULT 'client',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- תיעוד פתיחה יזומה של התקנון על ידי הגולש, לצורך עמידה בדרישות הדין.
  CREATE TABLE IF NOT EXISTS terms_views (
    token TEXT PRIMARY KEY,
    terms_version TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at DATETIME,
    used_at DATETIME
  );

  -- שליחות טופס יצירת קשר, עם קישור לתיעוד ההסכמה לתקנון.
  CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    terms_token TEXT NOT NULL,
    terms_version TEXT NOT NULL,
    terms_opened_at DATETIME,
    terms_acknowledged_at DATETIME,
    ip TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (terms_token) REFERENCES terms_views(token)
  );
`)

const adminExists = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get()
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 12)
  db.prepare("INSERT INTO users (username, password, name, email, role) VALUES (?, ?, ?, ?, 'admin')")
    .run('admin', hash, 'עו"ד אלעד אביטן', 'office@eladavitan-law.co.il')
  console.log('\n✓ Admin user created:')
  console.log('  Username: admin')
  console.log('  Password: admin123')
  console.log('  ⚠️  Change this password after first login!\n')
} else {
  console.log('Admin user already exists')
}

db.close()
console.log('✓ Database setup complete!')
