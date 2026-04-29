const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const os = require('os');
const { spawn, exec } = require('child_process');
const http = require('http');

// Dynamic import for ES modules
let openModule;
const getOpen = async () => {
  if (!openModule) {
    openModule = await import('open');
  }
  return openModule.default || openModule;
};

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    frame: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
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

// Simple in-memory storage (no native modules needed)
const memoryStorage = {
  credentials: {},
  chatSessions: [],
  messages: [],
  projects: [],
  files: [],
  settings: {},
};

// AI Provider APIs (using fetch/axios via preload)
ipcMain.handle('ai:openai:chat', async (event, params) => {
  try {
    // Return success - actual API call happens in renderer with stored key
    return { success: true, message: 'OpenAI API ready' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai:gemini:chat', async (event, params) => {
  return { success: true, message: 'Gemini API ready' };
});

ipcMain.handle('ai:huggingface:chat', async (event, params) => {
  return { success: true, message: 'HuggingFace API ready' };
});

// Local Models
ipcMain.handle('ai:ollama:chat', async (event, params) => {
  return { success: true, message: 'Ollama ready (localhost:11434)' };
});

ipcMain.handle('ai:lmstudio:chat', async (event, params) => {
  return { success: true, message: 'LM Studio ready (localhost:1234)' };
});

ipcMain.handle('ai:jan:chat', async (event, params) => {
  return { success: true, message: 'Jan ready (localhost:1337)' };
});

// Credentials (in-memory for now)
ipcMain.handle('credentials:store', async (event, { service, account, password }) => {
  try {
    memoryStorage.credentials[`${service}:${account}`] = password;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:get', async (event, { service, account }) => {
  try {
    const password = memoryStorage.credentials[`${service}:${account}`];
    return { success: true, password };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:delete', async (event, { service, account }) => {
  try {
    delete memoryStorage.credentials[`${service}:${account}`];
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:list', async (event, { service }) => {
  try {
    const creds = Object.entries(memoryStorage.credentials)
      .filter(([key]) => key.startsWith(`${service}:`))
      .map(([key, password]) => {
        const [, account] = key.split(':');
        return { account, password };
      });
    return { success: true, credentials: creds };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Database operations (in-memory)
ipcMain.handle('db:chat:create', (event, { name, provider, model }) => {
  try {
    const id = Date.now();
    memoryStorage.chatSessions.push({ id, name, provider, model, createdAt: new Date() });
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:chat:list', () => {
  try {
    return { success: true, sessions: memoryStorage.chatSessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:chat:delete', (event, { id }) => {
  try {
    memoryStorage.chatSessions = memoryStorage.chatSessions.filter(s => s.id !== id);
    memoryStorage.messages = memoryStorage.messages.filter(m => m.sessionId !== id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:message:add', (event, { sessionId, text, sender }) => {
  try {
    const id = Date.now();
    memoryStorage.messages.push({ id, sessionId, text, sender, timestamp: new Date() });
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:message:list', (event, { sessionId }) => {
  try {
    const messages = memoryStorage.messages.filter(m => m.sessionId === sessionId);
    return { success: true, messages };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Projects
ipcMain.handle('db:project:create', (event, { name, description, status, priority, dueDate }) => {
  try {
    const id = Date.now();
    memoryStorage.projects.push({ 
      id, name, description, status, priority, dueDate, 
      createdAt: new Date(),
      chats: [],
      files: [],
      agents: []
    });
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:project:list', () => {
  try {
    return { success: true, projects: memoryStorage.projects };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:project:update', (event, { id, updates }) => {
  try {
    const idx = memoryStorage.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryStorage.projects[idx] = { ...memoryStorage.projects[idx], ...updates };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// File handling
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
    const id = Date.now();
    memoryStorage.files.push({
      id,
      name: fileName,
      path: destPath,
      category,
      size: stats.size,
      createdAt: new Date()
    });
    
    return { success: true, id, path: destPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:list', () => {
  try {
    return { success: true, files: memoryStorage.files };
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

// Desktop App Integration
ipcMain.handle('app:open', async (event, { appName }) => {
  const apps = {
    outlook: 'outlook',
    gmail: 'https://gmail.com',
    whatsapp: 'whatsapp',
    instagram: 'instagram',
    facebook: 'facebook',
    jan: 'https://jan.ai/download',
    ollama: 'https://ollama.com/download',
    lmstudio: 'https://lmstudio.ai/'
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
  
  detectedApps.push('gmail', 'instagram', 'facebook');
  
  return { success: true, apps: detectedApps };
});

// Settings
ipcMain.handle('settings:get', (event, { key }) => {
  try {
    const value = memoryStorage.settings[key];
    return { success: true, value: value ? JSON.parse(value) : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:set', (event, { key, value }) => {
  try {
    memoryStorage.settings[key] = JSON.stringify(value);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// System Info
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

// Local AI Detection
const checkLocalAI = async (url, timeout = 2000) => {
  return new Promise((resolve) => {
    try {
      const req = http.get(url, { timeout }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ running: true, status: res.statusCode, data: data.substring(0, 500) });
        });
      });
      req.on('error', () => resolve({ running: false }));
      req.on('timeout', () => { req.destroy(); resolve({ running: false }); });
    } catch (e) {
      resolve({ running: false });
    }
  });
};

ipcMain.handle('ai:detect:ollama', async () => {
  const result = await checkLocalAI('http://localhost:11434/api/tags');
  return { success: true, ...result };
});

ipcMain.handle('ai:detect:lmstudio', async () => {
  const result = await checkLocalAI('http://localhost:1234/v1/models');
  return { success: true, ...result };
});

ipcMain.handle('ai:detect:jan', async () => {
  const result = await checkLocalAI('http://localhost:1337/v1/models');
  return { success: true, ...result };
});

ipcMain.handle('ai:ollama:models', async () => {
  return new Promise((resolve) => {
    http.get('http://localhost:11434/api/tags', { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ success: true, models: json.models || [] });
        } catch (e) {
          resolve({ success: false, models: [] });
        }
      });
    }).on('error', () => resolve({ success: false, models: [] }));
  });
});

ipcMain.handle('ai:lmstudio:models', async () => {
  return new Promise((resolve) => {
    http.get('http://localhost:1234/v1/models', { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ success: true, models: json.data || [] });
        } catch (e) {
          resolve({ success: false, models: [] });
        }
      });
    }).on('error', () => resolve({ success: false, models: [] }));
  });
});

ipcMain.handle('ai:jan:models', async () => {
  return new Promise((resolve) => {
    http.get('http://localhost:1337/v1/models', { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ success: true, models: json.data || [] });
        } catch (e) {
          resolve({ success: false, models: [] });
        }
      });
    }).on('error', () => resolve({ success: false, models: [] }));
  });
});

// Terminal / CLI (simplified without node-pty)
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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
