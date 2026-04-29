const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  
  // AI Providers
  ai: {
    openai: {
      chat: (params) => ipcRenderer.invoke('ai:openai:chat', params)
    },
    gemini: {
      chat: (params) => ipcRenderer.invoke('ai:gemini:chat', params)
    },
    huggingface: {
      chat: (params) => ipcRenderer.invoke('ai:huggingface:chat', params)
    },
    openrouter: {
      chat: (params) => ipcRenderer.invoke('ai:openrouter:chat', params)
    },
    nvidia: {
      chat: (params) => ipcRenderer.invoke('ai:nvidia:chat', params)
    }
  },
  
  // Local Models
  local: {
    models: {
      catalog: () => ipcRenderer.invoke('ai:models:catalog'),
      search: (params) => ipcRenderer.invoke('ai:models:search', params)
    },
    ollama: {
      chat: (params) => ipcRenderer.invoke('ai:ollama:chat', params),
      list: (params) => ipcRenderer.invoke('ai:ollama:list', params),
      pull: (params) => ipcRenderer.invoke('ai:ollama:pull', params),
      detect: () => ipcRenderer.invoke('ai:detect:ollama'),
      models: () => ipcRenderer.invoke('ai:ollama:models')
    },
    lmstudio: {
      chat: (params) => ipcRenderer.invoke('ai:lmstudio:chat', params),
      detect: () => ipcRenderer.invoke('ai:detect:lmstudio'),
      models: () => ipcRenderer.invoke('ai:lmstudio:models')
    },
    jan: {
      chat: (params) => ipcRenderer.invoke('ai:jan:chat', params),
      detect: () => ipcRenderer.invoke('ai:detect:jan'),
      models: () => ipcRenderer.invoke('ai:jan:models'),
      turboquants: () => ipcRenderer.invoke('ai:jan:turboquants'),
      engine: {
        status: () => ipcRenderer.invoke('jan:engine:status'),
        models: () => ipcRenderer.invoke('jan:engine:models'),
        serve: (params) => ipcRenderer.invoke('jan:engine:serve', params),
        openFolder: () => ipcRenderer.invoke('jan:engine:folder'),
        syncCli: () => ipcRenderer.invoke('jan:engine:sync-cli'),
        latestInstaller: () => ipcRenderer.invoke('jan:engine:latest-installer'),
        downloadInstaller: () => ipcRenderer.invoke('jan:engine:download-installer'),
        runInstaller: (params) => ipcRenderer.invoke('jan:engine:run-installer', params),
        onDownloadProgress: (callback) => {
          const listener = (event, payload) => callback(payload);
          ipcRenderer.on('jan:download-progress', listener);
          return () => ipcRenderer.removeListener('jan:download-progress', listener);
        }
      }
    }
  },
  
  // Credentials
  credentials: {
    store: (params) => ipcRenderer.invoke('credentials:store', params),
    get: (params) => ipcRenderer.invoke('credentials:get', params),
    delete: (params) => ipcRenderer.invoke('credentials:delete', params),
    list: (params) => ipcRenderer.invoke('credentials:list', params)
  },
  
  // Database - Chat
  db: {
    chat: {
      create: (params) => ipcRenderer.invoke('db:chat:create', params),
      list: () => ipcRenderer.invoke('db:chat:list'),
      delete: (params) => ipcRenderer.invoke('db:chat:delete', params)
    },
    message: {
      add: (params) => ipcRenderer.invoke('db:message:add', params),
      list: (params) => ipcRenderer.invoke('db:message:list', params)
    },
    project: {
      create: (params) => ipcRenderer.invoke('db:project:create', params),
      list: () => ipcRenderer.invoke('db:project:list'),
      update: (params) => ipcRenderer.invoke('db:project:update', params)
    },
    task: {
      create: (params) => ipcRenderer.invoke('db:task:create', params),
      list: (params) => ipcRenderer.invoke('db:task:list', params)
    },
    file: {
      list: () => ipcRenderer.invoke('db:file:list')
    }
  },
  
  // File operations
  file: {
    select: () => ipcRenderer.invoke('file:select'),
    upload: (params) => ipcRenderer.invoke('file:upload', params),
    list: () => ipcRenderer.invoke('file:list'),
    read: (params) => ipcRenderer.invoke('file:read', params)
  },
  
  // Desktop apps
  app: {
    open: (params) => ipcRenderer.invoke('app:open', params),
    detect: () => ipcRenderer.invoke('app:detect'),
    checkUpdate: () => ipcRenderer.invoke('app:check-update')
  },

  // Email channels
  email: {
    outlook: {
      status: () => ipcRenderer.invoke('email:outlook:status'),
      list: (params) => ipcRenderer.invoke('email:outlook:list', params),
      send: (params) => ipcRenderer.invoke('email:outlook:send', params),
      organize: (params) => ipcRenderer.invoke('email:outlook:organize', params)
    },
    gmail: {
      open: () => ipcRenderer.invoke('email:gmail:open')
    }
  },
  
  // Settings
  settings: {
    get: (params) => ipcRenderer.invoke('settings:get', params),
    set: (params) => ipcRenderer.invoke('settings:set', params)
  },
  
  // System
  system: {
    info: () => ipcRenderer.invoke('system:info'),
    health: () => ipcRenderer.invoke('system:health')
  },
  
  // Terminal
  terminal: {
    execute: (params) => ipcRenderer.invoke('terminal:execute', params)
  }
});
