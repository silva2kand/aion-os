const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const os = require('os');
const { exec, execFile, execSync, spawn } = require('child_process');
const http = require('http');
const https = require('https');

function optionalRequire(name) {
  try {
    return require(name);
  } catch (error) {
    console.warn(`[Aion OS] Optional dependency unavailable: ${name} (${error.message})`);
    return null;
  }
}

const axios = optionalRequire('axios');
const keytar = optionalRequire('keytar');
const Database = optionalRequire('better-sqlite3');

let openModule;
const getOpen = async () => {
  if (!openModule) {
    openModule = await import('open');
  }
  return openModule.default || openModule;
};

let mainWindow;
let db;

const memoryStorage = {
  credentials: {},
  chatSessions: [],
  messages: [],
  projects: [],
  tasks: [],
  files: [],
  settings: {},
};

const turboQuants = [
  {
    id: 'llama-3.1-8b-q4km',
    name: 'Llama 3.1 8B TurboQuant',
    baseModel: 'llama-3.1-8b',
    quant: 'Q4_K_M',
    ram: '8 GB',
    speed: 'Fast',
    target: 'Best balanced daily assistant profile',
  },
  {
    id: 'qwen-2.5-7b-q5km',
    name: 'Qwen 2.5 7B TurboQuant',
    baseModel: 'qwen-2.5-7b',
    quant: 'Q5_K_M',
    ram: '10 GB',
    speed: 'Fast',
    target: 'Coding and multilingual chat',
  },
  {
    id: 'phi-3-mini-q4',
    name: 'Phi-3 Mini TurboQuant',
    baseModel: 'phi-3-mini',
    quant: 'Q4_0',
    ram: '4 GB',
    speed: 'Very fast',
    target: 'Low-memory laptops and quick drafting',
  },
  {
    id: 'deepseek-coder-6.7b-q4km',
    name: 'DeepSeek Coder 6.7B TurboQuant',
    baseModel: 'deepseek-coder-6.7b',
    quant: 'Q4_K_M',
    ram: '8 GB',
    speed: 'Fast',
    target: 'Local code help with good latency',
  },
];

const localModelCatalog = [
  {
    id: 'phi3-mini-q4',
    name: 'Phi-3 Mini',
    engine: 'ollama',
    pullName: 'phi3:mini',
    family: 'Phi',
    category: 'Fast',
    parameters: '3.8B',
    quant: 'Q4',
    sizeBytes: 2300000000,
    minRamBytes: 4294967296,
    recommendedRamBytes: 8589934592,
    description: 'Very fast small model for everyday drafting and light reasoning.',
  },
  {
    id: 'llama3-2-3b',
    name: 'Llama 3.2 3B',
    engine: 'ollama',
    pullName: 'llama3.2:3b',
    family: 'Llama',
    category: 'Fast',
    parameters: '3B',
    quant: 'Q4',
    sizeBytes: 2000000000,
    minRamBytes: 4294967296,
    recommendedRamBytes: 8589934592,
    description: 'Lightweight general assistant that runs well on modest Windows PCs.',
  },
  {
    id: 'gemma2-2b',
    name: 'Gemma 2 2B',
    engine: 'ollama',
    pullName: 'gemma2:2b',
    family: 'Gemma',
    category: 'Fast',
    parameters: '2B',
    quant: 'Q4',
    sizeBytes: 1600000000,
    minRamBytes: 4294967296,
    recommendedRamBytes: 8589934592,
    description: 'Compact general model for quick local replies.',
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    engine: 'ollama',
    pullName: 'mistral:7b',
    family: 'Mistral',
    category: 'Balanced',
    parameters: '7B',
    quant: 'Q4_K_M',
    sizeBytes: 4100000000,
    minRamBytes: 8589934592,
    recommendedRamBytes: 17179869184,
    description: 'Strong balanced model for writing, planning, and analysis.',
  },
  {
    id: 'llama3-1-8b',
    name: 'Llama 3.1 8B',
    engine: 'ollama',
    pullName: 'llama3.1:8b',
    family: 'Llama',
    category: 'Balanced',
    parameters: '8B',
    quant: 'Q4_K_M',
    sizeBytes: 4700000000,
    minRamBytes: 8589934592,
    recommendedRamBytes: 17179869184,
    description: 'High-quality local general assistant profile.',
  },
  {
    id: 'qwen2-5-7b',
    name: 'Qwen 2.5 7B',
    engine: 'ollama',
    pullName: 'qwen2.5:7b',
    family: 'Qwen',
    category: 'Coding',
    parameters: '7B',
    quant: 'Q4_K_M',
    sizeBytes: 4300000000,
    minRamBytes: 8589934592,
    recommendedRamBytes: 17179869184,
    description: 'Good coding, multilingual, and structured-output model.',
  },
  {
    id: 'deepseek-coder-6-7b',
    name: 'DeepSeek Coder 6.7B',
    engine: 'ollama',
    pullName: 'deepseek-coder:6.7b',
    family: 'DeepSeek',
    category: 'Coding',
    parameters: '6.7B',
    quant: 'Q4_K_M',
    sizeBytes: 3800000000,
    minRamBytes: 8589934592,
    recommendedRamBytes: 17179869184,
    description: 'Local code generation and explanation model.',
  },
  {
    id: 'codellama-7b',
    name: 'CodeLlama 7B',
    engine: 'ollama',
    pullName: 'codellama:7b',
    family: 'CodeLlama',
    category: 'Coding',
    parameters: '7B',
    quant: 'Q4_K_M',
    sizeBytes: 4200000000,
    minRamBytes: 8589934592,
    recommendedRamBytes: 17179869184,
    description: 'Classic local coding model for completion and refactoring help.',
  },
  {
    id: 'llava-7b',
    name: 'LLaVA 7B Vision',
    engine: 'ollama',
    pullName: 'llava:7b',
    family: 'LLaVA',
    category: 'Vision',
    parameters: '7B',
    quant: 'Q4_K_M',
    sizeBytes: 4500000000,
    minRamBytes: 8589934592,
    recommendedRamBytes: 17179869184,
    description: 'Vision-capable local model for image understanding.',
  },
  {
    id: 'llama3-1-70b',
    name: 'Llama 3.1 70B',
    engine: 'ollama',
    pullName: 'llama3.1:70b',
    family: 'Llama',
    category: 'Large',
    parameters: '70B',
    quant: 'Q4_K_M',
    sizeBytes: 40000000000,
    minRamBytes: 68719476736,
    recommendedRamBytes: 103079215104,
    description: 'Large local model for high-end workstations only.',
  },
];

function getWindowsGpuInfo() {
  if (process.platform !== 'win32') return [];
  try {
    const raw = execSync('wmic path win32_VideoController get Name,AdapterRAM /format:csv', {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 5000,
    });

    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('Node,'))
      .map((line) => {
        const parts = line.split(',');
        const adapterRam = Number(parts[1]) || 0;
        const name = parts.slice(2).join(',').trim();
        return { name, vramBytes: adapterRam };
      })
      .filter((gpu) => gpu.name);
  } catch {
    return [];
  }
}

function getPcCapabilities() {
  const totalRamBytes = os.totalmem();
  const freeRamBytes = os.freemem();
  const gpus = getWindowsGpuInfo();
  const totalVramBytes = gpus.reduce((total, gpu) => total + (gpu.vramBytes || 0), 0);
  const cpu = os.cpus()[0] || {};

  return {
    platform: process.platform,
    arch: process.arch,
    cpuModel: cpu.model || 'Unknown CPU',
    cpuCores: os.cpus().length,
    totalRamBytes,
    freeRamBytes,
    totalVramBytes,
    gpus,
    tier: totalRamBytes >= 64 * 1024 ** 3 ? 'workstation' : totalRamBytes >= 16 * 1024 ** 3 ? 'balanced' : 'light',
  };
}

function modelFit(model, capabilities = getPcCapabilities()) {
  if (capabilities.totalRamBytes >= model.recommendedRamBytes) return 'recommended';
  if (capabilities.totalRamBytes >= model.minRamBytes) return 'runs';
  return 'too-large';
}

function uniqueExistingPaths(paths) {
  return [...new Set(paths.filter(Boolean))].filter((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  });
}

function findOnPath(command) {
  try {
    const lookup = process.platform === 'win32' ? 'where' : 'which';
    const result = execSync(`${lookup} ${command}`, {
      encoding: 'utf8',
      windowsHide: true,
      timeout: 5000,
    });
    return result.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || null;
  } catch {
    return null;
  }
}

function getJanBinaryCandidates() {
  const exe = process.platform === 'win32' ? 'jan.exe' : 'jan';
  const cliExe = process.platform === 'win32' ? 'jan-cli.exe' : 'jan';
  return uniqueExistingPaths([
    path.join(__dirname, 'bin', 'jan', exe),
    path.join(__dirname, 'bin', 'jan', cliExe),
    path.join(__dirname, 'bin', exe),
    path.join(__dirname, 'bin', cliExe),
    path.join(process.resourcesPath || '', 'bin', 'jan', exe),
    path.join(process.resourcesPath || '', 'bin', 'jan', cliExe),
    path.join(process.resourcesPath || '', exe),
    path.join(process.resourcesPath || '', cliExe),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Jan', 'resources', 'jan-cli.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Jan', 'jan-cli.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Jan', 'jan-cli.exe'),
    path.join(process.env.APPDATA || '', 'Jan', 'jan-cli.exe'),
    findOnPath(process.platform === 'win32' ? 'jan.exe' : 'jan'),
    findOnPath(process.platform === 'win32' ? 'jan-cli.exe' : 'jan'),
    findOnPath('jan'),
  ]);
}

function getJanBinary() {
  return getJanBinaryCandidates()[0] || null;
}

function runJanCli(args = [], options = {}) {
  const binary = getJanBinary();
  if (!binary) {
    return Promise.resolve({
      success: false,
      error: 'Aion Jan Engine is not installed yet. Add Jan CLI to aion-os/bin/jan/jan.exe or install Jan CLI on PATH.',
      binary: null,
    });
  }

  return new Promise((resolve) => {
    execFile(binary, args, {
      cwd: __dirname,
      windowsHide: true,
      timeout: options.timeout || 120000,
      maxBuffer: 10 * 1024 * 1024,
    }, (error, stdout = '', stderr = '') => {
      if (error) {
        resolve({ success: false, error: stderr || error.message, stdout, stderr, binary });
      } else {
        resolve({ success: true, stdout, stderr, binary });
      }
    });
  });
}

function parseJanModels(stdout = '') {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^models?/i.test(line) && !/^[-=]+$/.test(line))
    .map((line) => {
      const cleaned = line.replace(/^[*>\-\d.)\s]+/, '').trim();
      const firstColumn = cleaned.split(/\s{2,}|\t/)[0] || cleaned;
      return {
        id: firstColumn,
        name: firstColumn,
        raw: line,
        engine: 'aion-jan',
      };
    })
    .filter((model) => model.id && !/^(usage|commands|options):?/i.test(model.id));
}

async function getJanEngineStatus() {
  const binary = getJanBinary();
  const embedded = binary ? binary.includes(`${path.sep}aion-os${path.sep}bin${path.sep}`) || binary.includes(`${path.sep}resources${path.sep}`) : false;
  const api6767 = await fetchJson('http://127.0.0.1:6767/v1/models', 1200);
  const api1337 = await fetchJson('http://127.0.0.1:1337/v1/models', 1200);
  const cliModels = binary ? await runJanCli(['models', 'list'], { timeout: 15000 }) : { success: false };

  return {
    success: true,
    installed: Boolean(binary),
    embedded,
    binary,
    apiRunning: Boolean(api6767.running || api1337.running),
    preferredHost: api6767.running ? 'http://127.0.0.1:6767' : 'http://127.0.0.1:1337',
    cliModels: cliModels.success ? parseJanModels(cliModels.stdout) : [],
    apiModels: [...(api6767.models || []), ...(api1337.models || [])],
    api6767,
    api1337,
  };
}

function findJanCliCandidates() {
  return getJanBinaryCandidates();
}

function ensureAionJanDir() {
  const janDir = path.join(__dirname, 'bin', 'jan');
  fs.mkdirSync(janDir, { recursive: true });
  return janDir;
}

function syncJanCliIntoAion() {
  const janDir = ensureAionJanDir();
  const existing = findJanCliCandidates().filter((candidate) => !candidate.startsWith(janDir));
  const source = existing[0];
  if (!source) {
    return {
      success: false,
      error: 'No Jan CLI binary was found. Install Jan Desktop 0.7.8+ or download the Jan installer from Aion.',
      searched: getJanBinaryCandidates(),
    };
  }

  const dest = path.join(janDir, 'jan.exe');
  try {
    fs.copyFileSync(source, dest);
    return { success: true, source, dest };
  } catch (error) {
    return {
      success: false,
      error: `Failed to copy Jan CLI: ${error.message}`,
      source,
      dest,
    };
  }
}

async function getLatestJanWindowsAsset() {
  const client = requireAxios();
  const response = await client.get('https://api.github.com/repos/janhq/jan/releases/latest', {
    headers: { 'User-Agent': 'AionOS' },
    timeout: 10000,
  });
  const asset = (response.data.assets || []).find((item) => /x64-setup\.exe$/i.test(item.name));
  if (!asset) throw new Error('No Windows Jan setup asset was found in the latest release.');
  return {
    tag: response.data.tag_name,
    name: asset.name,
    size: asset.size,
    url: asset.browser_download_url,
  };
}

function encodePowerShell(script) {
  return Buffer.from(script, 'utf16le').toString('base64');
}

function runPowerShell(script, timeout = 60000) {
  return new Promise((resolve) => {
    const encoded = encodePowerShell(script);
    execFile('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], {
      windowsHide: true,
      timeout,
      maxBuffer: 10 * 1024 * 1024,
    }, (error, stdout = '', stderr = '') => {
      if (error) {
        resolve({ success: false, error: stderr || error.message, stdout, stderr });
        return;
      }

      const text = stdout.trim();
      try {
        resolve({ success: true, data: text ? JSON.parse(text) : null, stdout, stderr });
      } catch {
        resolve({ success: true, data: text, stdout, stderr });
      }
    });
  });
}

function psString(value) {
  return String(value || '').replace(/'/g, "''");
}

function initDatabase() {
  if (!Database) return;

  try {
    const dbPath = path.join(app.getPath('userData'), 'aion-os.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        provider TEXT,
        model TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        text TEXT NOT NULL,
        sender TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        priority TEXT DEFAULT 'medium',
        due_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        category TEXT,
        size INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  } catch (error) {
    console.warn(`[Aion OS] SQLite disabled, falling back to memory storage: ${error.message}`);
    db = null;
  }
}

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
  initDatabase();
  createWindow();
});

ipcMain.on('window-control', (event, action) => {
  if (!mainWindow) return;
  switch (action) {
    case 'minimize':
      mainWindow.minimize();
      break;
    case 'maximize':
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
      break;
    case 'close':
      mainWindow.close();
      break;
  }
});

function getMessageText(message) {
  return message?.content || message?.text || '';
}

function normalizeMessages(messages = []) {
  return messages
    .filter((message) => getMessageText(message).trim())
    .map((message) => ({
      role: message.role === 'ai' || message.role === 'assistant' ? 'assistant' : 'user',
      content: getMessageText(message),
    }));
}

function extractAssistantText(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (data.response) return data.response;
  if (data.output_text) return data.output_text;
  if (Array.isArray(data)) {
    return data.map(extractAssistantText).filter(Boolean).join('\n');
  }
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (data.choices?.[0]?.text) return data.choices[0].text;
  if (data.candidates?.[0]?.content?.parts) {
    return data.candidates[0].content.parts.map((part) => part.text || '').join('');
  }
  if (data.generated_text) return data.generated_text;
  return JSON.stringify(data, null, 2);
}

function requireAxios() {
  if (!axios) {
    throw new Error('axios is not installed. Run npm install in aion-os.');
  }
  return axios;
}

async function postChatCompletion(url, payload, headers = {}) {
  const client = requireAxios();
  const response = await client.post(url, payload, {
    headers: { 'Content-Type': 'application/json', ...headers },
    timeout: 120000,
  });
  return { success: true, data: response.data, text: extractAssistantText(response.data) };
}

ipcMain.handle('ai:openai:chat', async (event, { apiKey, messages, model = 'gpt-4o-mini' }) => {
  try {
    if (!apiKey) throw new Error('Missing OpenAI API key');
    return await postChatCompletion(
      'https://api.openai.com/v1/chat/completions',
      { model, messages: normalizeMessages(messages), temperature: 0.7 },
      { Authorization: `Bearer ${apiKey}` },
    );
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

ipcMain.handle('ai:gemini:chat', async (event, { apiKey, messages, model = 'gemini-1.5-flash' }) => {
  try {
    if (!apiKey) throw new Error('Missing Gemini API key');
    const contents = normalizeMessages(messages).map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));
    return await postChatCompletion(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { contents },
    );
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

ipcMain.handle('ai:huggingface:chat', async (event, { apiKey, inputs, messages, model = 'meta-llama/Llama-2-7b-chat-hf' }) => {
  try {
    if (!apiKey) throw new Error('Missing Hugging Face API key');
    const prompt = inputs || normalizeMessages(messages).map((m) => `${m.role}: ${m.content}`).join('\n');
    return await postChatCompletion(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: prompt },
      { Authorization: `Bearer ${apiKey}` },
    );
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

ipcMain.handle('ai:openrouter:chat', async (event, { apiKey, messages, model = 'openai/gpt-4o-mini' }) => {
  try {
    if (!apiKey) throw new Error('Missing OpenRouter API key');
    return await postChatCompletion(
      'https://openrouter.ai/api/v1/chat/completions',
      { model, messages: normalizeMessages(messages), temperature: 0.7 },
      {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://aion-os.local',
        'X-Title': 'Aion OS',
      },
    );
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

ipcMain.handle('ai:nvidia:chat', async (event, { apiKey, messages, model = 'meta/llama-3.1-8b-instruct' }) => {
  try {
    if (!apiKey) throw new Error('Missing NVIDIA API key');
    return await postChatCompletion(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      { model, messages: normalizeMessages(messages), temperature: 0.7, max_tokens: 2048 },
      { Authorization: `Bearer ${apiKey}` },
    );
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

ipcMain.handle('ai:ollama:chat', async (event, { messages, model = 'llama2', host = 'http://localhost:11434' }) => {
  try {
    const normalized = normalizeMessages(messages);
    return await postChatCompletion(`${host}/api/chat`, {
      model,
      messages: normalized,
      stream: false,
      options: { num_ctx: 8192 },
    });
  } catch (chatError) {
    try {
      const prompt = normalizeMessages(messages).map((m) => `${m.role}: ${m.content}`).join('\n');
      return await postChatCompletion(`${host}/api/generate`, { model, prompt, stream: false });
    } catch (generateError) {
      return { success: false, error: generateError.message || chatError.message };
    }
  }
});

ipcMain.handle('ai:lmstudio:chat', async (event, { messages, model = 'local-model', host = 'http://localhost:1234' }) => {
  try {
    return await postChatCompletion(`${host}/v1/chat/completions`, {
      model,
      messages: normalizeMessages(messages),
      temperature: 0.7,
    });
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
});

ipcMain.handle('ai:jan:chat', async (event, { messages, model = 'local-model', host }) => {
  const hosts = [
    host,
    'http://127.0.0.1:6767',
    'http://localhost:6767',
    'http://127.0.0.1:1337',
    'http://localhost:1337',
  ].filter(Boolean);

  let lastError = '';
  for (const candidateHost of [...new Set(hosts)]) {
    try {
      const result = await postChatCompletion(`${candidateHost}/v1/chat/completions`, {
        model,
        messages: normalizeMessages(messages),
        temperature: 0.7,
      });
      return { ...result, host: candidateHost, engine: candidateHost.includes('6767') ? 'aion-jan' : 'jan-desktop' };
    } catch (error) {
      lastError = error.response?.data?.error?.message || error.message;
    }
  }

  return { success: false, error: lastError || 'Aion Jan Engine is not running.' };
});

ipcMain.handle('jan:engine:status', async () => getJanEngineStatus());

ipcMain.handle('jan:engine:models', async () => {
  const status = await getJanEngineStatus();
  const apiModels = (status.apiModels || []).map((model) => ({
    id: model.id || model.name,
    name: model.id || model.name,
    raw: model,
    engine: status.preferredHost?.includes('6767') ? 'aion-jan' : 'jan-desktop',
  }));
  return {
    success: true,
    status,
    models: [...status.cliModels, ...apiModels].filter((model, index, all) => (
      model.id && all.findIndex((item) => item.id === model.id) === index
    )),
  };
});

ipcMain.handle('jan:engine:serve', async (event, { model, fit = true, detach = true } = {}) => {
  if (!model) return { success: false, error: 'Choose a Jan model to serve.' };
  const args = ['serve', model];
  if (fit) args.push('--fit');
  if (detach) args.push('--detach');

  const result = await runJanCli(args, { timeout: 120000 });
  if (!result.success && /detach|unknown|unexpected/i.test(result.error || '')) {
    const fallback = spawn(result.binary || getJanBinary(), ['serve', model, ...(fit ? ['--fit'] : [])], {
      cwd: __dirname,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    fallback.unref();
    return { success: true, detached: true, model, binary: result.binary || getJanBinary() };
  }
  return { ...result, model };
});

ipcMain.handle('jan:engine:folder', async () => {
  try {
    const janDir = path.join(__dirname, 'bin', 'jan');
    fs.mkdirSync(janDir, { recursive: true });
    const open = await getOpen();
    await open(janDir);
    return { success: true, path: janDir };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('jan:engine:sync-cli', async () => {
  try {
    return syncJanCliIntoAion();
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('jan:engine:latest-installer', async () => {
  try {
    const asset = await getLatestJanWindowsAsset();
    return { success: true, asset };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('jan:engine:download-installer', async () => {
  try {
    const asset = await getLatestJanWindowsAsset();
    const downloadsDir = path.join(ensureAionJanDir(), 'downloads');
    fs.mkdirSync(downloadsDir, { recursive: true });
    const dest = path.join(downloadsDir, asset.name);
    const client = requireAxios();
    const response = await client.get(asset.url, {
      responseType: 'stream',
      timeout: 10 * 60 * 1000,
      headers: { 'User-Agent': 'AionOS' },
    });
    let downloaded = 0;
    const total = Number(response.headers['content-length']) || asset.size || 0;
    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(dest);
      response.data.on('data', (chunk) => {
        downloaded += chunk.length;
        if (mainWindow && total) {
          mainWindow.webContents.send('jan:download-progress', {
            progress: Math.min(100, Math.round((downloaded / total) * 100)),
            downloaded,
            total,
            fileName: asset.name,
          });
        }
      });
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    if (mainWindow) {
      mainWindow.webContents.send('jan:download-progress', {
        progress: 100,
        downloaded,
        total: total || downloaded,
        fileName: asset.name,
        complete: true,
      });
    }
    return { success: true, asset, path: dest };
  } catch (error) {
    if (mainWindow) {
      mainWindow.webContents.send('jan:download-progress', {
        progress: 0,
        error: error.message,
      });
    }
    return { success: false, error: error.message };
  }
});

ipcMain.handle('jan:engine:run-installer', async (event, { installerPath } = {}) => {
  try {
    const target = installerPath || path.join(ensureAionJanDir(), 'downloads');
    const open = await getOpen();
    await open(target);
    return { success: true, path: target };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai:jan:turboquants', () => ({ success: true, models: turboQuants }));

ipcMain.handle('ai:models:catalog', async () => {
  const capabilities = getPcCapabilities();
  return {
    success: true,
    capabilities,
    models: localModelCatalog.map((model) => ({
      ...model,
      fit: modelFit(model, capabilities),
    })),
  };
});

ipcMain.handle('ai:models:search', async (event, { query = '', category = 'all' } = {}) => {
  const normalizedQuery = query.trim().toLowerCase();
  const capabilities = getPcCapabilities();
  const models = localModelCatalog
    .filter((model) => {
      const matchesCategory = category === 'all' || model.category.toLowerCase() === category.toLowerCase();
      const haystack = `${model.name} ${model.pullName} ${model.family} ${model.category} ${model.description}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
    })
    .map((model) => ({ ...model, fit: modelFit(model, capabilities) }));

  return { success: true, capabilities, models };
});

ipcMain.handle('ai:ollama:pull', async (event, { model, host = 'http://localhost:11434' }) => {
  try {
    if (!model) throw new Error('Missing model name');
    const catalogModel = localModelCatalog.find((item) => item.id === model || item.pullName === model || item.name === model);
    const pullName = catalogModel?.pullName || model;
    const result = await postChatCompletion(`${host}/api/pull`, { name: pullName, stream: false });
    return {
      ...result,
      model: pullName,
      catalog: catalogModel || null,
    };
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
});

ipcMain.handle('ai:ollama:list', async (event, { host = 'http://localhost:11434' } = {}) => {
  return fetchJson(`${host}/api/tags`, 3000, (json) => json.models || []);
});

ipcMain.handle('credentials:store', async (event, { service, account, password }) => {
  try {
    if (!service || !account) throw new Error('Service and account are required');
    if (keytar) {
      await keytar.setPassword(service, account, password || '');
    } else {
      memoryStorage.credentials[`${service}:${account}`] = password || '';
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:get', async (event, { service, account }) => {
  try {
    const password = keytar
      ? await keytar.getPassword(service, account)
      : memoryStorage.credentials[`${service}:${account}`];
    return { success: true, password: password || '' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:delete', async (event, { service, account }) => {
  try {
    if (keytar) {
      await keytar.deletePassword(service, account);
    } else {
      delete memoryStorage.credentials[`${service}:${account}`];
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('credentials:list', async (event, { service }) => {
  try {
    if (keytar) {
      return { success: true, credentials: await keytar.findCredentials(service) };
    }
    const credentials = Object.entries(memoryStorage.credentials)
      .filter(([key]) => key.startsWith(`${service}:`))
      .map(([key, password]) => ({ account: key.slice(service.length + 1), password }));
    return { success: true, credentials };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:chat:create', (event, { name, provider = 'local', model = '' }) => {
  try {
    if (db) {
      const result = db.prepare('INSERT INTO chat_sessions (name, provider, model) VALUES (?, ?, ?)').run(name, provider, model);
      return { success: true, id: result.lastInsertRowid };
    }
    const id = Date.now();
    memoryStorage.chatSessions.push({ id, name, provider, model, createdAt: new Date().toISOString() });
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:chat:list', () => {
  try {
    if (db) {
      const sessions = db.prepare('SELECT id, name, provider, model, created_at as createdAt FROM chat_sessions ORDER BY created_at DESC').all();
      return { success: true, sessions };
    }
    return { success: true, sessions: memoryStorage.chatSessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:chat:delete', (event, { id }) => {
  try {
    if (db) {
      db.prepare('DELETE FROM messages WHERE session_id = ?').run(id);
      db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(id);
    } else {
      memoryStorage.chatSessions = memoryStorage.chatSessions.filter((session) => session.id !== id);
      memoryStorage.messages = memoryStorage.messages.filter((message) => message.sessionId !== id);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:message:add', (event, { sessionId = null, text, sender, type = 'text' }) => {
  try {
    if (db) {
      const result = db.prepare('INSERT INTO messages (session_id, text, sender, type) VALUES (?, ?, ?, ?)').run(sessionId, text, sender, type);
      return { success: true, id: result.lastInsertRowid };
    }
    const id = Date.now();
    memoryStorage.messages.push({ id, sessionId, text, sender, type, timestamp: new Date().toISOString() });
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:message:list', (event, { sessionId = null } = {}) => {
  try {
    if (db) {
      const messages = db.prepare('SELECT id, session_id as sessionId, text, sender, type, timestamp FROM messages WHERE session_id IS ? ORDER BY timestamp ASC').all(sessionId);
      return { success: true, messages };
    }
    return { success: true, messages: memoryStorage.messages.filter((message) => message.sessionId === sessionId) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:project:create', (event, { name, description = '', status = 'active', priority = 'medium', dueDate = null }) => {
  try {
    if (db) {
      const result = db.prepare('INSERT INTO projects (name, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?)').run(name, description, status, priority, dueDate);
      return { success: true, id: result.lastInsertRowid };
    }
    const id = Date.now();
    memoryStorage.projects.push({ id, name, description, status, priority, dueDate, createdAt: new Date().toISOString() });
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:project:list', () => {
  try {
    if (db) {
      const projects = db.prepare('SELECT id, name, description, status, priority, due_date as dueDate, created_at as createdAt FROM projects ORDER BY created_at DESC').all();
      return { success: true, projects };
    }
    return { success: true, projects: memoryStorage.projects };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:project:update', (event, { id, updates }) => {
  try {
    const allowed = new Set(['name', 'description', 'status', 'priority', 'due_date', 'dueDate']);
    const entries = Object.entries(updates || {}).filter(([key]) => allowed.has(key));
    if (db && entries.length) {
      const fields = entries.map(([key]) => `${key === 'dueDate' ? 'due_date' : key} = ?`).join(', ');
      db.prepare(`UPDATE projects SET ${fields} WHERE id = ?`).run(...entries.map(([, value]) => value), id);
    } else {
      const idx = memoryStorage.projects.findIndex((project) => project.id === id);
      if (idx !== -1) memoryStorage.projects[idx] = { ...memoryStorage.projects[idx], ...updates };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:task:create', (event, { projectId = null, name, description = '', status = 'pending', priority = 'medium', dueDate = null }) => {
  try {
    if (db) {
      const result = db.prepare('INSERT INTO tasks (project_id, name, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)').run(projectId, name, description, status, priority, dueDate);
      return { success: true, id: result.lastInsertRowid };
    }
    const id = Date.now();
    memoryStorage.tasks.push({ id, projectId, name, description, status, priority, dueDate, createdAt: new Date().toISOString() });
    return { success: true, id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:task:list', (event, { projectId = null } = {}) => {
  try {
    if (db) {
      const tasks = projectId
        ? db.prepare('SELECT id, project_id as projectId, name, description, status, priority, due_date as dueDate, created_at as createdAt FROM tasks WHERE project_id = ? ORDER BY created_at DESC').all(projectId)
        : db.prepare('SELECT id, project_id as projectId, name, description, status, priority, due_date as dueDate, created_at as createdAt FROM tasks ORDER BY created_at DESC').all();
      return { success: true, tasks };
    }
    return { success: true, tasks: projectId ? memoryStorage.tasks.filter((task) => task.projectId === projectId) : memoryStorage.tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db:file:list', () => {
  try {
    if (db) {
      const files = db.prepare('SELECT id, name, path, category, size, created_at as createdAt FROM files ORDER BY created_at DESC').all();
      return { success: true, files };
    }
    return { success: true, files: memoryStorage.files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:select', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'] },
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'] },
        { name: 'Data', extensions: ['json', 'csv', 'xlsx'] },
      ],
    });

    if (result.canceled) return { success: true, files: [] };
    const files = result.filePaths.map((filePath) => {
      const stats = fs.statSync(filePath);
      return { path: filePath, name: path.basename(filePath), size: stats.size, category: getFileCategory(filePath) };
    });
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:upload', async (event, { filePath, category }) => {
  try {
    const uploadDir = path.join(app.getPath('userData'), 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = path.basename(filePath);
    const destPath = path.join(uploadDir, `${Date.now()}_${fileName}`);
    fs.copyFileSync(filePath, destPath);

    const stats = fs.statSync(destPath);
    if (db) {
      const result = db.prepare('INSERT INTO files (name, path, category, size) VALUES (?, ?, ?, ?)').run(fileName, destPath, category || getFileCategory(destPath), stats.size);
      return { success: true, id: result.lastInsertRowid, path: destPath };
    }

    const id = Date.now();
    memoryStorage.files.push({ id, name: fileName, path: destPath, category: category || getFileCategory(destPath), size: stats.size, createdAt: new Date().toISOString() });
    return { success: true, id, path: destPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:list', () => listFiles());

function listFiles() {
  try {
    if (db) {
      const files = db.prepare('SELECT id, name, path, category, size, created_at as createdAt FROM files ORDER BY created_at DESC').all();
      return { success: true, files };
    }
    return { success: true, files: memoryStorage.files };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

ipcMain.handle('file:read', (event, { filePath }) => {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > 2 * 1024 * 1024) {
      return { success: false, error: 'File is larger than 2 MB. Use upload/indexing for large files.' };
    }
    return { success: true, content: fs.readFileSync(filePath, 'utf8') };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

function getFileCategory(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.pdf', '.doc', '.docx', '.txt', '.rtf', '.md'].includes(ext)) return 'documents';
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'].includes(ext)) return 'images';
  if (['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(ext)) return 'videos';
  if (['.json', '.csv', '.xlsx', '.xls'].includes(ext)) return 'data';
  return 'other';
}

ipcMain.handle('app:open', async (event, { appName }) => {
  const apps = {
    outlook: 'outlook',
    gmail: 'https://gmail.com',
    github: 'https://github.com',
    slack: 'https://slack.com/signin',
    discord: 'https://discord.com/app',
    notion: 'https://notion.so',
    drive: 'https://drive.google.com',
    googleDrive: 'https://drive.google.com',
    dropbox: 'https://dropbox.com',
    stripe: 'https://dashboard.stripe.com',
    hubspot: 'https://app.hubspot.com',
    vercel: 'https://vercel.com/dashboard',
    cloudflare: 'https://dash.cloudflare.com',
    supabase: 'https://supabase.com/dashboard',
    canva: 'https://canva.com',
    elevenlabs: 'https://elevenlabs.io/app',
    whatsapp: 'whatsapp://',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    jan: 'https://jan.ai/download',
    ollama: 'https://ollama.com/download',
    lmstudio: 'https://lmstudio.ai/',
  };

  try {
    if (!apps[appName]) return { success: false, error: 'App not supported' };
    const open = await getOpen();
    await open(apps[appName]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('app:detect', async () => {
  const detectedApps = [];
  const appPaths = {
    outlook: process.platform === 'win32' ? 'C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE' : '/Applications/Microsoft Outlook.app',
    whatsapp: process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || '', 'WhatsApp', 'WhatsApp.exe') : '/Applications/WhatsApp.app',
  };

  for (const [name, appPath] of Object.entries(appPaths)) {
    try {
      if (appPath && fs.existsSync(appPath)) detectedApps.push(name);
    } catch {}
  }

  detectedApps.push('gmail', 'instagram', 'facebook');
  return { success: true, apps: [...new Set(detectedApps)] };
});

ipcMain.handle('email:outlook:status', async () => {
  if (process.platform !== 'win32') {
    return { success: false, connected: false, error: 'Outlook Classic automation is Windows-only.' };
  }

  const result = await runPowerShell(`
    $ErrorActionPreference = 'Stop'
    try {
      $outlook = New-Object -ComObject Outlook.Application
      $ns = $outlook.GetNamespace('MAPI')
      $accounts = @()
      foreach ($account in $ns.Accounts) {
        $accounts += [pscustomobject]@{
          DisplayName = $account.DisplayName
          SmtpAddress = $account.SmtpAddress
          AccountType = [string]$account.AccountType
        }
      }
      [pscustomobject]@{
        connected = $true
        accounts = $accounts
      } | ConvertTo-Json -Depth 5
    } catch {
      [pscustomobject]@{
        connected = $false
        error = $_.Exception.Message
      } | ConvertTo-Json -Depth 5
    }
  `);

  return result.success ? { success: true, ...result.data } : { success: false, connected: false, error: result.error };
});

ipcMain.handle('email:outlook:list', async (event, { folder = 'Inbox', limit = 25, unreadOnly = false } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 25, 100));
  const unreadFilter = unreadOnly ? '$items = $items | Where-Object { $_.UnRead -eq $true }' : '';
  const result = await runPowerShell(`
    $ErrorActionPreference = 'Stop'
    $outlook = New-Object -ComObject Outlook.Application
    $ns = $outlook.GetNamespace('MAPI')
    $target = $ns.GetDefaultFolder(6)
    $items = $target.Items
    $items.Sort('[ReceivedTime]', $true)
    ${unreadFilter}
    $messages = @()
    foreach ($item in $items) {
      if ($messages.Count -ge ${safeLimit}) { break }
      if ($null -eq $item.Subject) { continue }
      $messages += [pscustomobject]@{
        EntryID = $item.EntryID
        Subject = $item.Subject
        SenderName = $item.SenderName
        SenderEmailAddress = $item.SenderEmailAddress
        ReceivedTime = [string]$item.ReceivedTime
        UnRead = [bool]$item.UnRead
        Categories = $item.Categories
        BodyPreview = if ($item.Body) { $item.Body.Substring(0, [Math]::Min(500, $item.Body.Length)) } else { '' }
      }
    }
    $messages | ConvertTo-Json -Depth 5
  `);

  return result.success ? { success: true, messages: Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []) } : result;
});

ipcMain.handle('email:outlook:send', async (event, { to, subject, body, cc = '', bcc = '', displayOnly = true } = {}) => {
  if (!to) return { success: false, error: 'Recipient is required.' };
  const result = await runPowerShell(`
    $ErrorActionPreference = 'Stop'
    $outlook = New-Object -ComObject Outlook.Application
    $mail = $outlook.CreateItem(0)
    $mail.To = '${psString(to)}'
    $mail.CC = '${psString(cc)}'
    $mail.BCC = '${psString(bcc)}'
    $mail.Subject = '${psString(subject)}'
    $mail.Body = '${psString(body)}'
    if (${displayOnly ? '$true' : '$false'}) {
      $mail.Display()
      [pscustomobject]@{ sent = $false; displayed = $true } | ConvertTo-Json
    } else {
      $mail.Send()
      [pscustomobject]@{ sent = $true; displayed = $false } | ConvertTo-Json
    }
  `);

  return result.success ? { success: true, ...result.data } : result;
});

ipcMain.handle('email:outlook:organize', async (event, { limit = 100 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  const result = await runPowerShell(`
    $ErrorActionPreference = 'Stop'
    $outlook = New-Object -ComObject Outlook.Application
    $ns = $outlook.GetNamespace('MAPI')
    $inbox = $ns.GetDefaultFolder(6)
    $items = $inbox.Items
    $items.Sort('[ReceivedTime]', $true)
    $count = 0
    $updated = @()
    foreach ($item in $items) {
      if ($count -ge ${safeLimit}) { break }
      if ($null -eq $item.Subject) { continue }
      $subject = [string]$item.Subject
      $sender = [string]$item.SenderEmailAddress
      $category = $null
      if ($subject -match 'invoice|receipt|payment|vat|tax|payroll|hmrc|bookkeeping') { $category = 'Aion Accountant' }
      elseif ($subject -match 'contract|legal|solicitor|gdpr|compliance|dispute|court') { $category = 'Aion Solicitor' }
      elseif ($sender -match 'github|vercel|cloudflare|supabase') { $category = 'Aion Development' }
      elseif ($subject -match 'urgent|asap|deadline') { $category = 'Aion Priority' }
      if ($category) {
        $item.Categories = $category
        $item.Save()
        $updated += [pscustomobject]@{ EntryID = $item.EntryID; Subject = $subject; Category = $category }
      }
      $count++
    }
    $updated | ConvertTo-Json -Depth 5
  `, 120000);

  return result.success ? { success: true, updated: Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []) } : result;
});

ipcMain.handle('email:gmail:open', async () => {
  try {
    const open = await getOpen();
    await open('https://mail.google.com');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:get', (event, { key }) => {
  try {
    if (db) {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return { success: true, value: row ? JSON.parse(row.value) : null };
    }
    const value = memoryStorage.settings[key];
    return { success: true, value: value ? JSON.parse(value) : null };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:set', (event, { key, value }) => {
  try {
    const serialized = JSON.stringify(value);
    if (db) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, serialized);
    } else {
      memoryStorage.settings[key] = serialized;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('system:info', () => ({
  platform: process.platform,
  arch: process.arch,
  version: app.getVersion(),
  totalMemory: os.totalmem(),
  freeMemory: os.freemem(),
  cpus: os.cpus().length,
  capabilities: getPcCapabilities(),
  database: db ? 'sqlite' : 'memory',
  keychain: Boolean(keytar),
}));

ipcMain.handle('system:health', async () => {
  const [janStatus, ollamaStatus, lmStudioStatus] = await Promise.all([
    getJanEngineStatus(),
    fetchJson('http://localhost:11434/api/tags', 1200),
    fetchJson('http://localhost:1234/v1/models', 1200),
  ]);

  return {
    success: true,
    version: app.getVersion(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    capabilities: getPcCapabilities(),
    jan: janStatus,
    ollama: ollamaStatus,
    lmStudio: lmStudioStatus,
    database: db ? 'sqlite' : 'memory',
    keychain: Boolean(keytar),
    timestamp: new Date().toISOString(),
  };
});

ipcMain.handle('app:check-update', async () => {
  try {
    const client = requireAxios();
    const response = await client.get('https://api.github.com/repos/silva2kand/aion-os/releases/latest', {
      headers: { 'User-Agent': 'AionOS' },
      timeout: 5000,
    });
    const latestVersion = String(response.data.tag_name || '').replace(/^v/i, '');
    const currentVersion = app.getVersion();

    return {
      success: true,
      hasUpdate: Boolean(latestVersion && latestVersion !== currentVersion),
      currentVersion,
      latestVersion,
      releaseNotes: response.data.body || '',
      downloadUrl: response.data.html_url,
    };
  } catch (error) {
    return {
      success: false,
      hasUpdate: false,
      currentVersion: app.getVersion(),
      error: error.message,
    };
  }
});

function fetchJson(url, timeout = 3000, pickModels = (json) => json.data || json.models || []) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data || '{}');
          resolve({ success: true, running: true, status: res.statusCode, models: pickModels(json), data: data.substring(0, 500) });
        } catch (error) {
          resolve({ success: false, running: true, status: res.statusCode, models: [], error: error.message });
        }
      });
    });
    req.on('error', () => resolve({ success: false, running: false, models: [] }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, running: false, models: [] });
    });
  });
}

ipcMain.handle('ai:detect:ollama', async () => fetchJson('http://localhost:11434/api/tags'));
ipcMain.handle('ai:detect:lmstudio', async () => fetchJson('http://localhost:1234/v1/models'));
ipcMain.handle('ai:detect:jan', async () => fetchJson('http://localhost:1337/v1/models'));
ipcMain.handle('ai:ollama:models', async () => fetchJson('http://localhost:11434/api/tags'));
ipcMain.handle('ai:lmstudio:models', async () => fetchJson('http://localhost:1234/v1/models'));
ipcMain.handle('ai:jan:models', async () => fetchJson('http://localhost:1337/v1/models'));

ipcMain.handle('terminal:execute', async (event, { command, cwd }) => {
  return new Promise((resolve) => {
    exec(command, { cwd: cwd || os.homedir(), timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message, stdout, stderr });
      } else {
        resolve({ success: true, stdout, stderr });
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
