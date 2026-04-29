const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const axios = require('axios');
const keytar = require('keytar');
const Database = require('better-sqlite3');
const fs = require('fs');
const os = require('os');
const { spawn, exec } = require('child_process');

// Dynamic import for ES modules
let openModule;
const getOpen = async () => {
  if (!openModule) {
    openModule = await import('open');
  }
  return openModule.default || openModule;
};

let mainWindow;
let db;

// Initialize SQLite Database
function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'aion-os.db');
  db = new Database(dbPath);
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      provider TEXT,
      model TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      text TEXT NOT NULL,
      sender TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
    );
    
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      priority TEXT DEFAULT 'medium',
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      category TEXT,
      size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
  });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
});

// Window Controls
ipcMain.on('window-control', (event, action) => {
  switch(action) {
    case 'minimize': mainWindow.minimize(); break;
    case 'maximize': mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); break;
    case 'close': mainWindow.close(); break;
  }
});

// ==================== AI PROVIDER APIs ====================

// OpenAI API
ipcMain.handle('ai:openai:chat', async (event, { apiKey, messages, model = 'gpt-4' }) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: model,
      messages: messages,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

// Gemini API
ipcMain.handle('ai:gemini:chat', async (event, { apiKey, messages, model = 'gemini-pro' }) => {
  try {
    const lastMessage = messages[messages.length - 1];
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: lastMessage.content }] }]
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

// HuggingFace API
ipcMain.handle('ai:huggingface:chat', async (event, { apiKey, inputs, model = 'meta-llama/Llama-2-7b-chat-hf' }) => {
  try {
    const response = await axios.post(`https://api-inference.huggingface.co/models/${model}`, 
      { inputs },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

// OpenRouter API
ipcMain.handle('ai:openrouter:chat', async (event, { apiKey, messages, model = 'openai/gpt-3.5-turbo' }) => {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model,
      messages: messages,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aion-os.app',
        'X-Title': 'Aion OS'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

// NVIDIA NIM API
ipcMain.handle('ai:nvidia:chat', async (event, { apiKey, messages, model = 'meta/llama-3.1-8b-instruct' }) => {
  try {
    const response = await axios.post('https://integrate.api.nvidia.com/v1/chat/completions', {
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

// ==================== LOCAL MODEL SERVERS ====================

// Ollama Local Server
ipcMain.handle('ai:ollama:chat', async (event, { messages, model = 'llama2', host = 'http://localhost:11434' }) => {
  try {
    const response = await axios.post(`${host}/api/generate`, {
      model: model,
      prompt: messages[messages.length - 1].content,
      stream: false
    });
    return { success: true, data: { response: response.data.response } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai:ollama:list', async (event, { host = 'http://localhost:11434' }) => {
  try {
    const response = await axios.get(`${host}/api/tags`);
    return { success: true, models: response.data.models };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// LM Studio Server
ipcMain.handle('ai:lmstudio:chat', async (event, { messages, model = 'local-model', host = 'http://localhost:1234' }) => {
  try {
    const response = await axios.post(`${host}/v1/chat/completions`, {
      model: model,
      messages: messages,
      temperature: 0.7,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Jan Local Server
ipcMain.handle('ai:jan:chat', async (event, { messages, model = 'local-model', host = 'http://localhost:1337' }) => {
  try {
    const response = await axios.post(`${host}/v1/chat/completions`, {
      model: model,
      messages: messages,
      temperature: 0.7,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== SECURE CREDENTIAL STORAGE ====================

ipcMain.handle('credentials:store', async (event, { service, account, password }) => {
  try {
    await keytar.setPassword(service, account, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:get', async (event, { service, account }) => {
  try {
    const password = await keytar.getPassword(service, account);
    return { success: true, password };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:delete', async (event, { service, account }) => {
  try {
    await keytar.deletePassword(service, account);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:list', async (event, { service }) => {
  try {
    const credentials = await keytar.findCredentials(service);
    return { success: true, credentials };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== DATABASE OPERATIONS ====================

// Chat Sessions
ipcMain.handle('db:chat:create', (event, { name, provider, model }) => {
  try {
    const stmt = db.prepare('INSERT INTO chat_sessions (name, provider, model) VALUES (?, ?, ?)');
    const result = stmt.run(name, provider, model);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:chat:list', () => {
  try {
    const stmt = db.prepare('SELECT * FROM chat_sessions ORDER BY created_at DESC');
    const sessions = stmt.all();
    return { success: true, sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:chat:delete', (event, { id }) => {
  try {
    db.prepare('DELETE FROM messages WHERE session_id = ?').run(id);
    db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Messages
ipcMain.handle('db:message:add', (event, { sessionId, text, sender }) => {
  try {
    const stmt = db.prepare('INSERT INTO messages (session_id, text, sender) VALUES (?, ?, ?)');
    const result = stmt.run(sessionId, text, sender);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:message:list', (event, { sessionId }) => {
  try {
    const stmt = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC');
    const messages = stmt.all(sessionId);
    return { success: true, messages };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Projects
ipcMain.handle('db:project:create', (event, { name, description, status, priority, dueDate }) => {
  try {
    const stmt = db.prepare('INSERT INTO projects (name, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(name, description, status, priority, dueDate);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:project:list', () => {
  try {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    const projects = stmt.all();
    return { success: true, projects };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:project:update', (event, { id, updates }) => {
  try {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = db.prepare(`UPDATE projects SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Tasks
ipcMain.handle('db:task:create', (event, { projectId, name, description, status, priority, dueDate }) => {
  try {
    const stmt = db.prepare('INSERT INTO tasks (project_id, name, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(projectId, name, description, status, priority, dueDate);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:task:list', (event, { projectId }) => {
  try {
    const stmt = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC');
    const tasks = stmt.all(projectId);
    return { success: true, tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== FILE HANDLING ====================

ipcMain.handle('file:select', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt'] },
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
        { name: 'Data', extensions: ['json', 'csv', 'xlsx'] }
      ]
    });
    
    if (!result.canceled) {
      const files = result.filePaths.map(filePath => {
        const stats = fs.statSync(filePath);
        return {
          path: filePath,
          name: path.basename(filePath),
          size: stats.size,
          category: getFileCategory(filePath)
        };
      });
      return { success: true, files };
    }
    return { success: true, files: [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:upload', async (event, { filePath, category }) => {
  try {
    const uploadDir = path.join(app.getPath('userData'), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileName = path.basename(filePath);
    const destPath = path.join(uploadDir, `${Date.now()}_${fileName}`);
    
    fs.copyFileSync(filePath, destPath);
    
    const stats = fs.statSync(destPath);
    const stmt = db.prepare('INSERT INTO files (name, path, category, size) VALUES (?, ?, ?, ?)');
    const result = stmt.run(fileName, destPath, category, stats.size);
    
    return { success: true, id: result.lastInsertRowid, path: destPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:list', () => {
  try {
    const stmt = db.prepare('SELECT * FROM files ORDER BY created_at DESC');
    const files = stmt.all();
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:read', (event, { filePath }) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function getFileCategory(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const docExts = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
  const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
  const vidExts = ['.mp4', '.avi', '.mov', '.mkv'];
  
  if (docExts.includes(ext)) return 'documents';
  if (imgExts.includes(ext)) return 'images';
  if (vidExts.includes(ext)) return 'videos';
  return 'other';
}

// ==================== DESKTOP APP INTEGRATION ====================

ipcMain.handle('app:open', async (event, { appName }) => {
  const apps = {
    outlook: 'outlook',
    gmail: 'https://gmail.com',
    whatsapp: 'whatsapp',
    instagram: 'instagram',
    facebook: 'facebook'
  };
  
  try {
    if (apps[appName]) {
      const open = await getOpen();
      await open(apps[appName]);
      return { success: true };
    }
    return { success: false, error: 'App not supported' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('app:detect', async () => {
  const detectedApps = [];
  const appPaths = {
    outlook: process.platform === 'win32' ? 'C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE' : '/Applications/Microsoft Outlook.app',
    whatsapp: process.platform === 'win32' ? '%LOCALAPPDATA%\\WhatsApp\\WhatsApp.exe' : '/Applications/WhatsApp.app',
  };
  
  for (const [app, appPath] of Object.entries(appPaths)) {
    try {
      if (fs.existsSync(appPath)) {
        detectedApps.push(app);
      }
    } catch (e) {}
  }
  
  // Always add web-based apps
  detectedApps.push('gmail', 'instagram', 'facebook');
  
  return { success: true, apps: detectedApps };
});

// ==================== SETTINGS ====================

ipcMain.handle('settings:get', (event, { key }) => {
  try {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key);
    return { success: true, value: row ? JSON.parse(row.value) : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:set', (event, { key, value }) => {
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, JSON.stringify(value));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ==================== SYSTEM INFO ====================

ipcMain.handle('system:info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpus: os.cpus().length
  };
});

// ==================== TERMINAL / CLI ====================

ipcMain.handle('terminal:execute', async (event, { command, cwd }) => {
  return new Promise((resolve) => {
    exec(command, { cwd: cwd || os.homedir() }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message, stderr });
      } else {
        resolve({ success: true, stdout, stderr });
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (db) db.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});