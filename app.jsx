const { useState, useEffect, createContext, useContext, useRef } = React;

// ==================== THEME SYSTEM ====================
const themes = {
  dark: {
    name: 'Dark',
    bg: '#0f172a',
    panel: '#1e293b',
    panelHover: '#334155',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    aiBubble: '#1e293b',
    userBubble: '#3b82f6',
    sidebar: '#0f172a',
    header: '#1e293b',
    card: '#1e293b',
    cardHover: '#334155',
    input: '#334155',
    inputFocus: '#475569',
    button: '#3b82f6',
    buttonHover: '#2563eb',
    buttonSecondary: '#475569',
    buttonSecondaryHover: '#64748b',
    icon: '#94a3b8',
    iconHover: '#f8fafc',
  },
  midnight: {
    name: 'Midnight Purple',
    bg: '#0b0a1f',
    panel: '#151428',
    panelHover: '#252340',
    text: '#e0e0ff',
    textMuted: '#8888aa',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    border: '#2a2847',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    aiBubble: '#151428',
    userBubble: '#8b5cf6',
    sidebar: '#0b0a1f',
    header: '#151428',
    card: '#151428',
    cardHover: '#252340',
    input: '#252340',
    inputFocus: '#353255',
    button: '#8b5cf6',
    buttonHover: '#7c3aed',
    buttonSecondary: '#353255',
    buttonSecondaryHover: '#454370',
    icon: '#8888aa',
    iconHover: '#e0e0ff',
  },
  neon: {
    name: 'AI Neon',
    bg: '#050510',
    panel: '#0a0a20',
    panelHover: '#151530',
    text: '#00f0ff',
    textMuted: '#00a0aa',
    accent: '#ff00ff',
    accentHover: '#dd00dd',
    border: '#1a1a40',
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff0055',
    aiBubble: '#0a0a20',
    userBubble: '#ff00ff',
    sidebar: '#050510',
    header: '#0a0a20',
    card: '#0a0a20',
    cardHover: '#151530',
    input: '#151530',
    inputFocus: '#252550',
    button: '#ff00ff',
    buttonHover: '#dd00dd',
    buttonSecondary: '#252550',
    buttonSecondaryHover: '#353570',
    icon: '#00a0aa',
    iconHover: '#00f0ff',
  },
  light: {
    name: 'Light',
    bg: '#f8fafc',
    panel: '#ffffff',
    panelHover: '#f1f5f9',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    aiBubble: '#f1f5f9',
    userBubble: '#3b82f6',
    sidebar: '#ffffff',
    header: '#ffffff',
    card: '#ffffff',
    cardHover: '#f8fafc',
    input: '#f1f5f9',
    inputFocus: '#e2e8f0',
    button: '#3b82f6',
    buttonHover: '#2563eb',
    buttonSecondary: '#f1f5f9',
    buttonSecondaryHover: '#e2e8f0',
    icon: '#64748b',
    iconHover: '#0f172a',
  },
};

// ==================== STORE ====================
const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [state, setState] = useState({
    // Navigation
    activeModule: 'chat',
    activeView: 'list',
    sidebarCollapsed: false,

    // Theme
    currentTheme: 'dark',

    // AI State
    isAutonomousMode: false,
    agentStatus: 'idle',
    activeProject: null,

    // Chat
    chatSessions: [],
    activeChatSession: null,
    messages: [],

    // Agents
    agents: [],
    activeAgent: null,
    agentWorkflows: [],

    // Projects
    projects: [],

    // Library
    library: [],

    // Integrations
    integrations: {
      gmail: { connected: false, config: {} },
      github: { connected: false, config: {} },
      slack: { connected: false, config: {} },
      notion: { connected: false, config: {} },
      drive: { connected: false, config: {} },
      outlook: { connected: false, config: {} },
    },

    // Local AI Detection
    localAIStatus: {
      ollama: { running: false, host: 'http://localhost:11434', models: [] },
      lmStudio: { running: false, host: 'http://localhost:1234', models: [] },
      jan: { running: false, host: 'http://localhost:6767', models: [], installed: false, embedded: false, binary: null, engine: null },
    },

    // Jan AI
    janModels: [
      { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', size: '4.7 GB', downloaded: false, downloading: false, category: 'General', description: 'Meta\'s latest general-purpose model' },
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', size: '40 GB', downloaded: false, downloading: false, category: 'General', description: 'Large version for complex tasks' },
      { id: 'mistral-7b', name: 'Mistral 7B', size: '4.1 GB', downloaded: false, downloading: false, category: 'General', description: 'Efficient open-source model' },
      { id: 'codellama-7b', name: 'CodeLlama 7B', size: '4.2 GB', downloaded: false, downloading: false, category: 'Coding', description: 'Specialized for code generation' },
      { id: 'gemma-2-9b', name: 'Gemma 2 9B', size: '5.4 GB', downloaded: false, downloading: false, category: 'General', description: 'Google\'s lightweight model' },
      { id: 'qwen-2.5-7b', name: 'Qwen 2.5 7B', size: '4.3 GB', downloaded: false, downloading: false, category: 'General', description: 'Alibaba\'s multilingual model' },
      { id: 'phi-3-mini', name: 'Phi-3 Mini', size: '2.3 GB', downloaded: false, downloading: false, category: 'General', description: 'Microsoft\'s compact model' },
      { id: 'deepseek-coder-6.7b', name: 'DeepSeek Coder 6.7B', size: '3.8 GB', downloaded: false, downloading: false, category: 'Coding', description: 'Excellent for programming tasks' },
      { id: 'llava-7b', name: 'LLaVA 7B', size: '4.5 GB', downloaded: false, downloading: false, category: 'Vision', description: 'Multimodal vision model' },
      { id: 'wizardlm-2-7b', name: 'WizardLM 2 7B', size: '4.2 GB', downloaded: false, downloading: false, category: 'General', description: 'Enhanced instruction following' },
    ],

    // UK Professional Services
    ukServices: {
      solicitor: {
        enabled: false,
        autoOrganize: true,
        categories: ['Contracts', 'Compliance', 'Disputes', 'IP Law'],
        lastSync: null,
      },
      accountant: {
        enabled: false,
        autoOrganize: true,
        categories: ['VAT', 'Tax Returns', 'Payroll', 'Bookkeeping'],
        lastSync: null,
      },
    },

    // Voice Chat
    voiceState: {
      isListening: false,
      isSpeaking: false,
      transcript: '',
      supported: false,
    },

    // Memory
    globalMemory: {},
    sessionMemory: [],

    // UI State
    modal: null,
    notifications: [],
    showWelcome: true,

    // Tasks
    activeTasks: [],
    taskHistory: [],

    // Account
    account: {
      email: 'user@aion.os',
      name: 'User',
      avatar: null,
      workspace: 'Personal',
      plan: 'Free',
    },

    // Usage Analytics
    usage: {
      tokensUsed: 0,
      apiCalls: 0,
      connectorCalls: {},
      dailyLimit: 10000,
      monthlyLimit: 100000,
      lastReset: new Date(),
    },

    // Scheduled Tasks (Cron)
    scheduledTasks: [],

    // Mail-to-Task System
    mailToTask: {
      enabled: true,
      emailAddress: 'tasks@aion.local',
      workflowEmails: [],
      approvedSenders: [
        { email: 'user@gmail.com', name: 'Primary User', enabled: true },
      ],
      autoProcess: true,
      lastReceived: null,
    },

    // Data Controls
    dataControls: {
      storeHistory: true,
      indexFiles: true,
      allowTraining: false,
      autoDeleteDays: 30,
      syncEnabled: true,
      encryptionEnabled: true,
    },

    // Cloud Browser
    cloudBrowser: {
      enabled: true,
      defaultSearch: 'google',
      safeMode: true,
      allowDownloads: true,
      history: [],
    },

    // My Computer Integration
    myComputer: {
      enabled: true,
      allowedPaths: [],
      blockedPaths: ['C:\\Windows', 'C:\\Program Files'],
      autoScan: true,
      lastScan: null,
    },

    // Skills System
    skills: {
      writing: { enabled: true, level: 'advanced' },
      coding: { enabled: true, level: 'advanced' },
      analysis: { enabled: true, level: 'intermediate' },
      automation: { enabled: true, level: 'beginner' },
      dataExtraction: { enabled: true, level: 'intermediate' },
      reasoning: { enabled: true, level: 'advanced' },
      vision: { enabled: false, level: 'none' },
      audio: { enabled: false, level: 'none' },
    },

    // Connectors System (Full Manus-style)
    connectors: {
      // AI Models
      ollama: { enabled: false, type: 'local', category: 'ai', description: 'Local LLM inference' },
      lmstudio: { enabled: false, type: 'local', category: 'ai', description: 'LM Studio local models' },
      jan: { enabled: false, type: 'local', category: 'ai', description: 'Jan AI model hub' },
      openai: { enabled: false, type: 'cloud', category: 'ai', description: 'OpenAI GPT models' },
      anthropic: { enabled: false, type: 'cloud', category: 'ai', description: 'Claude AI models' },
      gemini: { enabled: false, type: 'cloud', category: 'ai', description: 'Google Gemini' },
      grok: { enabled: false, type: 'cloud', category: 'ai', description: 'xAI Grok' },
      huggingface: { enabled: false, type: 'cloud', category: 'ai', description: 'Hugging Face models' },

      // Communication
      gmail: { enabled: false, type: 'oauth', category: 'communication', description: 'Email automation' },
      outlook: { enabled: false, type: 'oauth', category: 'communication', description: 'Microsoft 365 mail' },
      slack: { enabled: false, type: 'oauth', category: 'communication', description: 'Team messaging' },
      discord: { enabled: false, type: 'api', category: 'communication', description: 'Discord bot' },

      // Productivity
      notion: { enabled: false, type: 'oauth', category: 'productivity', description: 'Workspace notes' },
      googleDrive: { enabled: false, type: 'oauth', category: 'productivity', description: 'File storage' },
      dropbox: { enabled: false, type: 'oauth', category: 'productivity', description: 'Cloud storage' },
      github: { enabled: false, type: 'oauth', category: 'productivity', description: 'Code repositories' },

      // Business
      stripe: { enabled: false, type: 'api', category: 'business', description: 'Payment processing' },
      hubspot: { enabled: false, type: 'oauth', category: 'business', description: 'CRM platform' },

      // Development
      vercel: { enabled: false, type: 'oauth', category: 'dev', description: 'Deployment platform' },
      cloudflare: { enabled: false, type: 'api', category: 'dev', description: 'CDN and DNS' },
      supabase: { enabled: false, type: 'api', category: 'dev', description: 'Database backend' },

      // Media
      canva: { enabled: false, type: 'oauth', category: 'media', description: 'Design platform' },
      elevenlabs: { enabled: false, type: 'api', category: 'media', description: 'Voice synthesis' },
    },

    // Active Chat Connectors (per-chat permissions)
    activeConnectors: ['ollama', 'gmail', 'github'],

    // Settings
    settings: {
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'DD/MM/YYYY',
      notifications: true,
      sounds: true,
      autoSave: true,
      defaultModel: 'ollama',
    },

    // Personalization
    personalization: {
      assistantName: 'Aion',
      assistantPersonality: 'professional',
      customPrompt: '',
      shortcuts: {},
    },
  });

  const actions = {
    // Navigation
    setModule: (module) => setState(prev => ({ ...prev, activeModule: module, activeView: 'list' })),
    setActiveView: (view) => setState(prev => ({ ...prev, activeView: view })),
    toggleSidebar: () => setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed })),

    // Theme
    setTheme: (theme) => setState(prev => ({ ...prev, currentTheme: theme })),

    // AI
    toggleAutonomous: () => setState(prev => ({ ...prev, isAutonomousMode: !prev.isAutonomousMode })),
    setAgentStatus: (status) => setState(prev => ({ ...prev, agentStatus: status })),
    setActiveProject: (project) => setState(prev => ({ ...prev, activeProject: project })),

    // Chat
    addChatSession: async (session) => {
      let id = Date.now();
      if (window.electron?.db?.chat) {
        const result = await window.electron.db.chat.create({
          name: session.name,
          provider: session.provider || 'local',
          model: session.model || '',
        });
        if (result?.success) id = result.id;
      }
      setState(prev => ({
        ...prev,
        chatSessions: [...prev.chatSessions, { ...session, id, createdAt: new Date() }],
        activeChatSession: id,
        messages: [],
      }));
    },
    removeChatSession: (id) => {
      if (window.electron?.db?.chat) {
        window.electron.db.chat.delete({ id });
      }
      setState(prev => ({
        ...prev,
        chatSessions: prev.chatSessions.filter(s => s.id !== id),
        activeChatSession: prev.activeChatSession === id ? null : prev.activeChatSession,
      }));
    },
    setActiveChatSession: (id) => setState(prev => ({ ...prev, activeChatSession: id, messages: [] })),
    addMessage: (message) => setState(prev => {
      const savedMessage = { ...message, id: message.id || Date.now(), timestamp: new Date() };
      if (window.electron?.db?.message && message.type !== 'thinking') {
        window.electron.db.message.add({
          sessionId: prev.activeChatSession || null,
          text: savedMessage.text,
          sender: savedMessage.role,
          type: savedMessage.type || 'text',
        });
      }
      return {
        ...prev,
        messages: [...prev.messages, savedMessage]
      };
    }),
    clearMessages: () => setState(prev => ({ ...prev, messages: [] })),

    // Agents
    addAgent: (agent) => setState(prev => ({
      ...prev,
      agents: [...prev.agents, { ...agent, id: Date.now(), createdAt: new Date() }]
    })),
    removeAgent: (id) => setState(prev => ({
      ...prev,
      agents: prev.agents.filter(a => a.id !== id)
    })),
    setActiveAgent: (agent) => setState(prev => ({ ...prev, activeAgent: agent })),
    addWorkflow: (workflow) => setState(prev => ({
      ...prev,
      agentWorkflows: [...prev.agentWorkflows, { ...workflow, id: Date.now() }]
    })),

    // Projects
    addProject: (project) => setState(prev => ({
      ...prev,
      projects: [...prev.projects, { ...project, id: Date.now(), createdAt: new Date() }]
    })),
    removeProject: (id) => setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    })),
    updateProject: (id, updates) => setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p)
    })),

    // Library
    addLibraryItem: (item) => setState(prev => ({
      ...prev,
      library: [...prev.library, { ...item, id: Date.now(), addedAt: new Date() }]
    })),
    removeLibraryItem: (id) => setState(prev => ({
      ...prev,
      library: prev.library.filter(i => i.id !== id)
    })),

    // Integrations
    setIntegration: (name, config) => setState(prev => ({
      ...prev,
      integrations: { ...prev.integrations, [name]: config }
    })),

    // Memory
    saveToGlobalMemory: (key, value) => setState(prev => ({
      ...prev,
      globalMemory: { ...prev.globalMemory, [key]: value }
    })),
    addToSessionMemory: (entry) => setState(prev => ({
      ...prev,
      sessionMemory: [...prev.sessionMemory, { ...entry, id: Date.now(), timestamp: new Date() }]
    })),

    // UI
    setModal: (modal) => setState(prev => ({ ...prev, modal })),
    closeModal: () => setState(prev => ({ ...prev, modal: null })),
    addNotification: (notification) => setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { ...notification, id: Date.now() }]
    })),
    removeNotification: (id) => setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    })),
    setShowWelcome: (show) => setState(prev => ({ ...prev, showWelcome: show })),

    // Tasks
    addTask: (task) => setState(prev => ({
      ...prev,
      activeTasks: [...prev.activeTasks, { ...task, id: Date.now(), status: 'pending', createdAt: new Date() }]
    })),
    updateTask: (id, updates) => setState(prev => ({
      ...prev,
      activeTasks: prev.activeTasks.map(t => t.id === id ? { ...t, ...updates } : t)
    })),
    completeTask: (id) => setState(prev => {
      const task = prev.activeTasks.find(t => t.id === id);
      if (task) {
        return {
          ...prev,
          activeTasks: prev.activeTasks.filter(t => t.id !== id),
          taskHistory: [{ ...task, status: 'completed', completedAt: new Date() }, ...prev.taskHistory]
        };
      }
      return prev;
    }),

    // Local AI Detection
    setLocalAIStatus: (provider, status) => setState(prev => ({
      ...prev,
      localAIStatus: { ...prev.localAIStatus, [provider]: { ...prev.localAIStatus[provider], ...status } }
    })),
    checkLocalAI: async () => {
      // Check Ollama
      try {
        if (window.electron && window.electron.local && window.electron.local.ollama) {
          const detectResult = await window.electron.local.ollama.detect();
          if (detectResult && detectResult.running) {
            const modelsResult = await window.electron.local.ollama.models();
            setState(prev => ({
              ...prev,
              localAIStatus: {
                ...prev.localAIStatus,
                ollama: {
                  ...prev.localAIStatus.ollama,
                  running: true,
                  models: modelsResult.models || []
                }
              }
            }));
          } else {
            setState(prev => ({
              ...prev,
              localAIStatus: {
                ...prev.localAIStatus,
                ollama: { ...prev.localAIStatus.ollama, running: false, models: [] }
              }
            }));
          }
        }
      } catch (e) {
        console.error('Ollama detection error:', e);
      }

      // Check LM Studio
      try {
        if (window.electron && window.electron.local && window.electron.local.lmstudio) {
          const detectResult = await window.electron.local.lmstudio.detect();
          if (detectResult && detectResult.running) {
            const modelsResult = await window.electron.local.lmstudio.models();
            setState(prev => ({
              ...prev,
              localAIStatus: {
                ...prev.localAIStatus,
                lmStudio: {
                  ...prev.localAIStatus.lmStudio,
                  running: true,
                  models: modelsResult.models || []
                }
              }
            }));
          } else {
            setState(prev => ({
              ...prev,
              localAIStatus: {
                ...prev.localAIStatus,
                lmStudio: { ...prev.localAIStatus.lmStudio, running: false, models: [] }
              }
            }));
          }
        }
      } catch (e) {
        console.error('LM Studio detection error:', e);
      }

      // Check Jan
      try {
        if (window.electron && window.electron.local && window.electron.local.jan) {
          const engineResult = await window.electron.local.jan.engine?.status?.();
          const detectResult = engineResult?.apiRunning ? {
            running: true,
            host: engineResult.preferredHost,
            installed: engineResult.installed,
            embedded: engineResult.embedded,
            binary: engineResult.binary,
            models: [...(engineResult.cliModels || []), ...(engineResult.apiModels || [])],
          } : await window.electron.local.jan.detect();
          if ((detectResult && detectResult.running) || engineResult?.installed) {
            const modelsResult = engineResult?.success
              ? { models: [...(engineResult.cliModels || []), ...(engineResult.apiModels || [])] }
              : await window.electron.local.jan.models();
            setState(prev => ({
              ...prev,
              localAIStatus: {
                ...prev.localAIStatus,
                jan: {
                  ...prev.localAIStatus.jan,
                  running: Boolean(detectResult.running || engineResult?.apiRunning),
                  host: engineResult?.preferredHost || detectResult.host || prev.localAIStatus.jan.host,
                  models: modelsResult.models || [],
                  installed: Boolean(engineResult?.installed || detectResult.installed || detectResult.running),
                  embedded: Boolean(engineResult?.embedded),
                  binary: engineResult?.binary || null,
                  engine: engineResult?.preferredHost?.includes('6767') ? 'aion-jan' : 'jan-desktop'
                }
              }
            }));
          } else {
            setState(prev => ({
              ...prev,
              localAIStatus: {
                ...prev.localAIStatus,
                jan: { ...prev.localAIStatus.jan, running: false, models: [], installed: false, embedded: false, binary: null }
              }
            }));
          }
        }
      } catch (e) {
        console.error('Jan detection error:', e);
      }
    },

    // Jan AI Models
    downloadJanModel: (modelId) => setState(prev => ({
      ...prev,
      janModels: prev.janModels.map(m => m.id === modelId ? { ...m, downloading: true } : m)
    })),
    completeJanDownload: (modelId) => setState(prev => ({
      ...prev,
      janModels: prev.janModels.map(m => m.id === modelId ? { ...m, downloading: false, downloaded: true } : m)
    })),
    resetJanDownload: (modelId) => setState(prev => ({
      ...prev,
      janModels: prev.janModels.map(m => m.id === modelId ? { ...m, downloading: false } : m)
    })),

    // UK Services
    toggleUKService: (service) => setState(prev => ({
      ...prev,
      ukServices: {
        ...prev.ukServices,
        [service]: { ...prev.ukServices[service], enabled: !prev.ukServices[service].enabled }
      }
    })),
    updateUKService: (service, updates) => setState(prev => ({
      ...prev,
      ukServices: {
        ...prev.ukServices,
        [service]: { ...prev.ukServices[service], ...updates }
      }
    })),

    // Voice Chat
    setVoiceState: (updates) => setState(prev => ({
      ...prev,
      voiceState: { ...prev.voiceState, ...updates }
    })),
    startVoiceInput: () => setState(prev => ({ ...prev, voiceState: { ...prev.voiceState, isListening: true } })),
    stopVoiceInput: () => setState(prev => ({ ...prev, voiceState: { ...prev.voiceState, isListening: false } })),
    setVoiceTranscript: (text) => setState(prev => ({ ...prev, voiceState: { ...prev.voiceState, transcript: text } })),

    // Account
    updateAccount: (updates) => setState(prev => ({ ...prev, account: { ...prev.account, ...updates } })),

    // Usage Analytics
    incrementUsage: (type, amount = 1) => setState(prev => ({
      ...prev,
      usage: {
        ...prev.usage,
        [type]: prev.usage[type] + amount,
        connectorCalls: {
          ...prev.usage.connectorCalls,
          [type]: (prev.usage.connectorCalls[type] || 0) + amount
        }
      }
    })),
    resetUsage: () => setState(prev => ({
      ...prev,
      usage: { ...prev.usage, tokensUsed: 0, apiCalls: 0, connectorCalls: {}, lastReset: new Date() }
    })),

    // Scheduled Tasks (Cron)
    addScheduledTask: (task) => setState(prev => ({
      ...prev,
      scheduledTasks: [...prev.scheduledTasks, { ...task, id: Date.now(), createdAt: new Date() }]
    })),
    removeScheduledTask: (id) => setState(prev => ({
      ...prev,
      scheduledTasks: prev.scheduledTasks.filter(t => t.id !== id)
    })),
    toggleScheduledTask: (id) => setState(prev => ({
      ...prev,
      scheduledTasks: prev.scheduledTasks.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    })),

    // Mail-to-Task System
    updateMailToTask: (updates) => setState(prev => ({ ...prev, mailToTask: { ...prev.mailToTask, ...updates } })),
    addApprovedSender: (sender) => setState(prev => ({
      ...prev,
      mailToTask: {
        ...prev.mailToTask,
        approvedSenders: [...prev.mailToTask.approvedSenders, { ...sender, enabled: true }]
      }
    })),
    removeApprovedSender: (email) => setState(prev => ({
      ...prev,
      mailToTask: {
        ...prev.mailToTask,
        approvedSenders: prev.mailToTask.approvedSenders.filter(s => s.email !== email)
      }
    })),
    toggleApprovedSender: (email) => setState(prev => ({
      ...prev,
      mailToTask: {
        ...prev.mailToTask,
        approvedSenders: prev.mailToTask.approvedSenders.map(s =>
          s.email === email ? { ...s, enabled: !s.enabled } : s
        )
      }
    })),
    addWorkflowEmail: (email) => setState(prev => ({
      ...prev,
      mailToTask: {
        ...prev.mailToTask,
        workflowEmails: [...prev.mailToTask.workflowEmails, { ...email, id: Date.now() }]
      }
    })),

    // Data Controls
    updateDataControls: (updates) => setState(prev => ({ ...prev, dataControls: { ...prev.dataControls, ...updates } })),

    // Cloud Browser
    updateCloudBrowser: (updates) => setState(prev => ({ ...prev, cloudBrowser: { ...prev.cloudBrowser, ...updates } })),
    addBrowserHistory: (entry) => setState(prev => ({
      ...prev,
      cloudBrowser: {
        ...prev.cloudBrowser,
        history: [entry, ...prev.cloudBrowser.history].slice(0, 100)
      }
    })),

    // My Computer
    updateMyComputer: (updates) => setState(prev => ({ ...prev, myComputer: { ...prev.myComputer, ...updates } })),
    addAllowedPath: (path) => setState(prev => ({
      ...prev,
      myComputer: { ...prev.myComputer, allowedPaths: [...prev.myComputer.allowedPaths, path] }
    })),
    removeAllowedPath: (path) => setState(prev => ({
      ...prev,
      myComputer: { ...prev.myComputer, allowedPaths: prev.myComputer.allowedPaths.filter(p => p !== path) }
    })),

    // Skills System
    toggleSkill: (skill) => setState(prev => ({
      ...prev,
      skills: { ...prev.skills, [skill]: { ...prev.skills[skill], enabled: !prev.skills[skill].enabled } }
    })),
    setSkillLevel: (skill, level) => setState(prev => ({
      ...prev,
      skills: { ...prev.skills, [skill]: { ...prev.skills[skill], level } }
    })),

    // Connectors System
    toggleConnector: (connector) => setState(prev => ({
      ...prev,
      connectors: {
        ...prev.connectors,
        [connector]: { ...prev.connectors[connector], enabled: !prev.connectors[connector].enabled }
      }
    })),
    setActiveConnectors: (connectors) => setState(prev => ({ ...prev, activeConnectors: connectors })),
    updateConnector: (connector, updates) => setState(prev => ({
      ...prev,
      connectors: { ...prev.connectors, [connector]: { ...prev.connectors[connector], ...updates } }
    })),

    // Settings
    updateSettings: (updates) => setState(prev => ({ ...prev, settings: { ...prev.settings, ...updates } })),

    // Personalization
    updatePersonalization: (updates) => setState(prev => ({ ...prev, personalization: { ...prev.personalization, ...updates } })),
    setAssistantName: (name) => setState(prev => ({ ...prev, personalization: { ...prev.personalization, assistantName: name } })),
    setAssistantPersonality: (personality) => setState(prev => ({ ...prev, personalization: { ...prev.personalization, assistantPersonality: personality } })),
  };

  useEffect(() => {
    if (!window.electron?.db?.chat) return;

    window.electron.db.chat.list().then(result => {
      if (result?.success && Array.isArray(result.sessions)) {
        setState(prev => ({ ...prev, chatSessions: result.sessions }));
      }
    });
  }, []);

  useEffect(() => {
    if (!window.electron?.db?.message || !state.activeChatSession) return;

    window.electron.db.message.list({ sessionId: state.activeChatSession }).then(result => {
      if (result?.success && Array.isArray(result.messages)) {
        setState(prev => ({
          ...prev,
          messages: result.messages.map(message => ({
            id: message.id,
            role: message.sender === 'ai' || message.sender === 'assistant' ? 'ai' : 'user',
            text: message.text,
            type: message.type || 'text',
            timestamp: message.timestamp,
          })),
        }));
      }
    });
  }, [state.activeChatSession]);

  return (
    <StoreContext.Provider value={{ ...state, ...actions }}>
      {children}
    </StoreContext.Provider>
  );
};

const useAionStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useAionStore must be used within StoreProvider');
  return context;
};

// ==================== UI COMPONENTS ====================

const ThemeProvider = ({ children }) => {
  const { currentTheme } = useAionStore();
  const theme = themes[currentTheme] || themes.dark;

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--theme-${key}`, value);
      }
    });
  }, [theme]);

  return (
    <div className="h-screen w-screen overflow-hidden" style={{
      backgroundColor: theme.bg,
      color: theme.text,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {children}
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) => {
  const { currentTheme } = useAionStore();
  const theme = themes[currentTheme];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.button,
          color: '#ffffff',
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: theme.buttonSecondary,
          color: theme.text,
          border: `1px solid ${theme.border}`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.textMuted,
          border: 'none',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.accent,
          border: `1px solid ${theme.accent}`,
        };
      default:
        return {};
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${sizeClasses[size]} ${className}`}
      style={{
        ...getVariantStyles(),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') e.target.style.backgroundColor = theme.buttonHover;
          else if (variant === 'secondary') e.target.style.backgroundColor = theme.buttonSecondaryHover;
          else if (variant === 'ghost') e.target.style.color = theme.text;
        }
      }}
      onMouseLeave={(e) => {
        const styles = getVariantStyles();
        e.target.style.backgroundColor = styles.backgroundColor;
        e.target.style.color = styles.color;
      }}
    >
      {children}
    </button>
  );
};

const Card = ({ children, title, className = '', onClick, hover = true }) => {
  const { currentTheme } = useAionStore();
  const theme = themes[currentTheme];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        backgroundColor: theme.card,
        border: `1px solid ${theme.border}`,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (hover && onClick) {
          e.currentTarget.style.backgroundColor = theme.cardHover;
          e.currentTarget.style.borderColor = theme.accent;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme.card;
        e.currentTarget.style.borderColor = theme.border;
      }}
    >
      {title && (
        <h3 className="text-sm font-semibold mb-3" style={{ color: theme.text }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const { currentTheme } = useAionStore();
  const theme = themes[currentTheme];

  const variants = {
    default: { bg: theme.buttonSecondary, color: theme.text },
    success: { bg: '#10b981', color: '#ffffff' },
    warning: { bg: '#f59e0b', color: '#ffffff' },
    error: { bg: '#ef4444', color: '#ffffff' },
    primary: { bg: theme.accent, color: '#ffffff' },
    secondary: { bg: theme.panelHover, color: theme.text },
  };

  const v = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`}
      style={{ backgroundColor: v.bg, color: v.color }}
    >
      {children}
    </span>
  );
};

const Input = ({ placeholder, value, onChange, onKeyPress, className = '', multiline = false, rows = 3 }) => {
  const { currentTheme } = useAionStore();
  const theme = themes[currentTheme];

  const commonStyles = {
    backgroundColor: theme.input,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
  };

  if (multiline) {
    return (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        rows={rows}
        className={`resize-none ${className}`}
        style={commonStyles}
        onFocus={(e) => {
          e.target.style.borderColor = theme.accent;
          e.target.style.backgroundColor = theme.inputFocus;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = theme.border;
          e.target.style.backgroundColor = theme.input;
        }}
      />
    );
  }

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      className={className}
      style={commonStyles}
      onFocus={(e) => {
        e.target.style.borderColor = theme.accent;
        e.target.style.backgroundColor = theme.inputFocus;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = theme.border;
        e.target.style.backgroundColor = theme.input;
      }}
    />
  );
};

// ==================== SIDEBAR ====================

const Sidebar = () => {
  const { activeModule, setModule, sidebarCollapsed, toggleSidebar, currentTheme, agents, projects, setTheme } = useAionStore();
  const theme = themes[currentTheme];

  const menuItems = [
    { id: 'chat', label: 'Chat', icon: '💬', shortcut: 'C' },
    { id: 'agents', label: 'Agents', icon: '🤖', shortcut: 'A', badge: agents.length },
    { id: 'projects', label: 'Projects', icon: '📁', shortcut: 'P', badge: projects.length },
    { id: 'library', label: 'Library', icon: '📚', shortcut: 'L' },
    { id: 'jan', label: 'Jan AI', icon: '📦', shortcut: 'J' },
    { id: 'skills', label: 'Skills', icon: '🎯', shortcut: 'S' },
    { id: 'connectors', label: 'Connectors', icon: '🔌', shortcut: 'N' },
    { id: 'ukservices', label: 'UK Services', icon: '⚖️', shortcut: 'U' },
    { id: 'settings', label: 'Settings', icon: '⚙️', shortcut: ',' },
    { id: 'history', label: 'History', icon: '🕐', shortcut: 'H' },
  ];

  const themeOptions = Object.entries(themes).map(([key, t]) => ({ id: key, label: t.name }));

  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      style={{
        backgroundColor: theme.sidebar,
        borderRight: `1px solid ${theme.border}`,
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.border}` }}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg"
              style={{ backgroundColor: theme.accent, color: '#ffffff' }}
            >
              A
            </div>
            <span className="font-semibold" style={{ color: theme.text }}>Aion OS</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg mx-auto"
            style={{ backgroundColor: theme.accent, color: '#ffffff' }}
          >
            A
          </div>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: theme.icon }}
            onMouseEnter={(e) => e.target.style.color = theme.iconHover}
            onMouseLeave={(e) => e.target.style.color = theme.icon}
          >
            ←
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setModule(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeModule === item.id ? 'font-medium' : ''}`}
            style={{
              backgroundColor: activeModule === item.id ? theme.panelHover : 'transparent',
              color: activeModule === item.id ? theme.text : theme.textMuted,
              borderLeft: activeModule === item.id ? `3px solid ${theme.accent}` : '3px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (activeModule !== item.id) {
                e.currentTarget.style.backgroundColor = theme.panel;
                e.currentTarget.style.color = theme.text;
              }
            }}
            onMouseLeave={(e) => {
              if (activeModule !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.textMuted;
              }
            }}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <span className="text-lg">{item.icon}</span>
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {item.badge > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: theme.accent, color: '#ffffff' }}
                  >
                    {item.badge}
                  </span>
                )}
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: theme.panel, color: theme.textMuted }}
                >
                  {item.shortcut}
                </span>
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Quick Actions */}
      {!sidebarCollapsed && (
        <div className="p-3 space-y-2" style={{ borderTop: `1px solid ${theme.border}` }}>
          <Button variant="primary" size="sm" className="w-full">
            <span>+</span> New Agent
          </Button>
          <Button variant="secondary" size="sm" className="w-full">
            <span>⚡</span> Run Task
          </Button>
        </div>
      )}

      {/* Theme Switcher */}
      {!sidebarCollapsed && (
        <div className="p-3" style={{ borderTop: `1px solid ${theme.border}` }}>
          <select
            value={currentTheme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2"
            style={{
              backgroundColor: theme.input,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          >
            {themeOptions.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Collapse button when collapsed */}
      {sidebarCollapsed && (
        <div className="p-3" style={{ borderTop: `1px solid ${theme.border}` }}>
          <button
            onClick={toggleSidebar}
            className="w-full p-2 rounded-lg transition-colors flex justify-center"
            style={{ color: theme.icon }}
            onMouseEnter={(e) => e.target.style.color = theme.iconHover}
            onMouseLeave={(e) => e.target.style.color = theme.icon}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== CHAT CONNECTORS BUTTON ====================

const ChatConnectorsButton = () => {
  const { connectors, activeConnectors, setActiveConnectors, currentTheme } = useAionStore();
  const theme = themes[currentTheme];
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const enabledConnectors = Object.entries(connectors).filter(([_, c]) => c.enabled);
  const activeCount = activeConnectors.length;

  const toggleConnectorActive = (key) => {
    if (activeConnectors.includes(key)) {
      setActiveConnectors(activeConnectors.filter(k => k !== key));
    } else {
      setActiveConnectors([...activeConnectors, key]);
    }
  };

  const getConnectorIcon = (category) => {
    switch(category) {
      case 'ai': return '🤖';
      case 'communication': return '💬';
      case 'productivity': return '📁';
      case 'business': return '💼';
      case 'dev': return '🛠️';
      case 'media': return '🎨';
      default: return '🔌';
    }
  };

  return (
    <div className="relative" ref={popupRef}>
      <Button
        variant={activeCount > 0 ? 'primary' : 'secondary'}
        size="sm"
        className="flex-shrink-0"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle active connectors"
      >
        🔌 {activeCount > 0 && <span className="ml-1">({activeCount})</span>}
      </Button>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 w-72 rounded-xl overflow-hidden shadow-2xl z-50"
          style={{
            backgroundColor: theme.panel,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="p-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <div className="font-medium text-sm" style={{ color: theme.text }}>
              Active Connectors
            </div>
            <div className="text-xs" style={{ color: theme.textMuted }}>
              Select tools for this chat
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {enabledConnectors.length === 0 ? (
              <div className="p-3 text-center text-sm" style={{ color: theme.textMuted }}>
                No connectors enabled. Go to Settings → Connectors to enable tools.
              </div>
            ) : (
              enabledConnectors.map(([key, connector]) => (
                <div
                  key={key}
                  onClick={() => toggleConnectorActive(key)}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: activeConnectors.includes(key) ? theme.accent + '20' : 'transparent',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-xs"
                    style={{ backgroundColor: activeConnectors.includes(key) ? theme.accent : theme.panel }}
                  >
                    {activeConnectors.includes(key) ? '✓' : ''}
                  </div>
                  <span className="text-lg">{getConnectorIcon(connector.category)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium capitalize" style={{ color: theme.text }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>
                      {connector.description}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2" style={{ borderTop: `1px solid ${theme.border}` }}>
            <button
              onClick={() => setActiveConnectors([])}
              className="w-full p-2 rounded-lg text-sm text-center transition-colors"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = theme.panel; e.target.style.color = theme.text; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = theme.textMuted; }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== CHAT VIEW ====================

const getModelName = (model, fallback) => {
  if (!model) return fallback;
  return model.name || model.id || model.model || fallback;
};

const formatBytes = (bytes) => {
  const value = Number(bytes) || 0;
  if (!value) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
};

const getFitBadge = (fit) => {
  if (fit === 'recommended') return { label: 'Recommended', variant: 'success' };
  if (fit === 'runs') return { label: 'Runs', variant: 'warning' };
  return { label: 'Too Large', variant: 'error' };
};

const extractAIText = (result) => {
  if (!result) return '';
  if (result.text) return result.text;
  const data = result.data || result;
  if (typeof data === 'string') return data;
  if (data.response) return data.response;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (data.choices?.[0]?.text) return data.choices[0].text;
  if (data.candidates?.[0]?.content?.parts) {
    return data.candidates[0].content.parts.map(part => part.text || '').join('');
  }
  if (Array.isArray(data)) {
    return data.map(item => item.generated_text || item.text || '').filter(Boolean).join('\n');
  }
  return JSON.stringify(data, null, 2);
};

const ChatView = () => {
  const {
    messages,
    addMessage,
    activeAgent,
    currentTheme,
    settings,
    activeConnectors,
    localAIStatus,
    checkLocalAI,
    chatSessions,
    activeChatSession,
    setActiveChatSession,
    addChatSession,
    removeChatSession,
    isAutonomousMode,
    voiceState,
    setVoiceState,
    startVoiceInput,
    stopVoiceInput,
    setVoiceTranscript,
  } = useAionStore();

  const theme = themes[currentTheme];
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setVoiceState({ isListening: true, supported: true });
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setVoiceTranscript(transcript);
        setInputText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();
      };

      recognitionRef.current.onend = () => {
        stopVoiceInput();
      };

      setVoiceState({ supported: true });
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (voiceState.isListening) {
      recognitionRef.current.stop();
    } else {
      setInputText('');
      recognitionRef.current.start();
    }
  };

  const speakMessage = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    checkLocalAI?.();
  }, []);

  const getStoredApiKey = async (provider) => {
    if (!window.electron?.credentials) return '';
    const accounts = [
      provider,
      provider.toLowerCase(),
      `${provider.toLowerCase()}:apiKey`,
    ];

    for (const account of accounts) {
      const result = await window.electron.credentials.get({ service: 'aion-os', account });
      if (result?.success && result.password) return result.password;
    }

    return '';
  };

  const resolveChatProvider = () => {
    const preferred = settings.defaultModel || 'ollama';
    const connectorOrder = [preferred, ...activeConnectors, 'jan', 'ollama', 'lmstudio', 'openai', 'gemini', 'openrouter', 'nvidia', 'huggingface'];
    const uniqueOrder = [...new Set(connectorOrder)];

    for (const provider of uniqueOrder) {
      if (provider === 'jan' && localAIStatus.jan.running) {
        return {
          provider,
          label: 'Jan',
          model: settings.janModel || getModelName(localAIStatus.jan.models[0], 'local-model'),
          call: (payload) => window.electron.local.jan.chat(payload),
        };
      }
      if (provider === 'ollama' && localAIStatus.ollama.running) {
        return {
          provider,
          label: 'Ollama',
          model: settings.ollamaModel || getModelName(localAIStatus.ollama.models[0], 'llama2'),
          call: (payload) => window.electron.local.ollama.chat(payload),
        };
      }
      if ((provider === 'lmstudio' || provider === 'lmStudio') && localAIStatus.lmStudio.running) {
        return {
          provider: 'lmstudio',
          label: 'LM Studio',
          model: settings.lmStudioModel || getModelName(localAIStatus.lmStudio.models[0], 'local-model'),
          call: (payload) => window.electron.local.lmstudio.chat(payload),
        };
      }
      if (window.electron?.ai?.[provider]) {
        return {
          provider,
          label: provider.charAt(0).toUpperCase() + provider.slice(1),
          model: provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini',
          call: (payload) => window.electron.ai[provider].chat(payload),
          needsKey: true,
        };
      }
    }

    return null;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    const providerConfig = resolveChatProvider();

    addMessage({ role: 'user', text: textToSend, type: 'text' });
    setInputText('');
    setIsLoading(true);

    const thinkingId = Date.now() + 1;
    addMessage({
      id: thinkingId,
      role: 'ai',
      text: providerConfig
        ? `Routing to ${providerConfig.label} (${providerConfig.model})...`
        : 'Checking available AI connectors...',
      type: 'thinking',
      steps: ['Preparing context', 'Selecting model', 'Waiting for response'],
    });

    try {
      if (!window.electron || !providerConfig) {
        throw new Error('No AI connector is available. Start Jan, Ollama, or LM Studio, or save an API key for a cloud connector.');
      }

      const outboundMessages = [...messages, { role: 'user', text: textToSend }]
        .filter(message => message.type !== 'thinking')
        .map(message => ({
          role: message.role === 'ai' ? 'assistant' : 'user',
          content: message.text,
        }));

      const payload = {
        messages: outboundMessages,
        model: providerConfig.model,
      };

      if (providerConfig.needsKey) {
        const apiKey = await getStoredApiKey(providerConfig.provider);
        if (!apiKey) {
          throw new Error(`Missing ${providerConfig.label} API key. Save it in Integrations > API Keys first.`);
        }
        payload.apiKey = apiKey;
      }

      const result = await providerConfig.call(payload);
      if (!result?.success) {
        throw new Error(result?.error || `${providerConfig.label} did not return a successful response.`);
      }

      const responseText = extractAIText(result) || 'The model returned an empty response.';
      setIsLoading(false);
      addMessage({
        role: 'ai',
        text: responseText,
        type: 'response',
        provider: providerConfig.provider,
        model: providerConfig.model,
      });
    } catch (error) {
      setIsLoading(false);
      addMessage({
        role: 'ai',
        text: `I couldn't complete that request yet.\n\n${error.message}`,
        type: 'response',
        actions: ['Open Jan', 'Check Connectors', 'Save API Key'],
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Sessions Sidebar */}
      <div
        className="w-64 flex flex-col"
        style={{
          backgroundColor: theme.panel,
          borderRight: `1px solid ${theme.border}`,
        }}
      >
        <div className="p-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              const name = prompt('Session name:');
              if (name) addChatSession({ name });
            }}
          >
            + New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div
            onClick={() => setActiveChatSession(null)}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              !activeChatSession ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: !activeChatSession ? theme.panelHover : 'transparent',
              color: !activeChatSession ? theme.text : theme.textMuted,
            }}
          >
            <div className="text-sm">Current Session</div>
            <div className="text-xs" style={{ color: theme.textMuted }}>
              {messages.length} messages
            </div>
          </div>

          {chatSessions.map(session => (
            <div
              key={session.id}
              onClick={() => setActiveChatSession(session.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                activeChatSession === session.id ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: activeChatSession === session.id ? theme.panelHover : 'transparent',
                color: activeChatSession === session.id ? theme.text : theme.textMuted,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm truncate">{session.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeChatSession(session.id); }}
                  className="text-xs opacity-0 hover:opacity-100 transition-opacity"
                  style={{ color: theme.error }}
                >
                  ×
                </button>
              </div>
              <div className="text-xs" style={{ color: theme.textMuted }}>
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: theme.header,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center gap-4">
            <h2 style={{ color: theme.text }} className="font-semibold">
              {activeChatSession ? chatSessions.find(s => s.id === activeChatSession)?.name : 'Chat'}
            </h2>
            {activeAgent && (
              <Badge variant="primary">
                <span className="mr-1">🤖</span> {activeAgent.name}
              </Badge>
            )}
            {isAutonomousMode && (
              <Badge variant="warning">
                <span className="mr-1">⚡</span> Autonomous
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showAgentPanel ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowAgentPanel(!showAgentPanel)}
            >
              🤖 Agent Panel
            </Button>
            <Button variant="ghost" size="sm">⚙️</Button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{ backgroundColor: theme.bg }}
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center" style={{ color: theme.textMuted }}>
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
                Start a conversation
              </h3>
              <p className="text-center max-w-md">
                Ask me anything, create an agent, or run a task. I'm here to help!
              </p>
              <div className="flex gap-2 mt-6">
                <Button variant="secondary" size="sm">📝 Summarize text</Button>
                <Button variant="secondary" size="sm">💻 Write code</Button>
                <Button variant="secondary" size="sm">🔍 Research topic</Button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-2xl ${
                  msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`}
                style={{
                  backgroundColor: msg.role === 'user' ? theme.userBubble : theme.aiBubble,
                  color: msg.role === 'user' ? '#ffffff' : theme.text,
                  border: msg.role === 'user' ? 'none' : `1px solid ${theme.border}`,
                  boxShadow: msg.type === 'thinking' ? `0 0 20px ${theme.accent}20` : 'none',
                }}
              >
                {msg.type === 'thinking' && (
                  <div className="flex items-center gap-2 mb-2" style={{ color: theme.accent }}>
                    <span className="animate-pulse">●</span>
                    <span className="text-sm font-medium">AI is thinking...</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.text}
                </div>

                {msg.steps && (
                  <div className="mt-3 space-y-1">
                    {msg.steps.map((step, sidx) => (
                      <div
                        key={sidx}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        <span>○</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.actions && (
                  <div className="flex gap-2 mt-3">
                    {msg.actions.map((action, aidx) => (
                      <Button key={aidx} variant="outline" size="sm">
                        {action}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Message Actions Bar */}
                <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: `1px solid ${theme.border}40` }}>
                  <div
                    className="text-xs"
                    style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : theme.textMuted }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakMessage(msg.text)}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{
                          color: theme.textMuted,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => { e.target.style.color = theme.accent; e.target.style.backgroundColor = theme.panel; }}
                        onMouseLeave={(e) => { e.target.style.color = theme.textMuted; e.target.style.backgroundColor = 'transparent'; }}
                        title="Read aloud"
                      >
                        🔊 Speak
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{
                          color: theme.textMuted,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => { e.target.style.color = theme.accent; e.target.style.backgroundColor = theme.panel; }}
                        onMouseLeave={(e) => { e.target.style.color = theme.textMuted; e.target.style.backgroundColor = 'transparent'; }}
                        title="Copy to clipboard"
                        onClick={() => navigator.clipboard.writeText(msg.text)}
                      >
                        📋 Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className="p-4"
          style={{
            backgroundColor: theme.header,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <Button variant="secondary" size="sm" className="flex-shrink-0">
              📎
            </Button>

            {/* Voice Input Button */}
            {voiceState.supported && (
              <Button
                variant={voiceState.isListening ? 'primary' : 'secondary'}
                size="sm"
                className={`flex-shrink-0 ${voiceState.isListening ? 'animate-pulse' : ''}`}
                onClick={toggleVoiceInput}
                title={voiceState.isListening ? 'Stop listening' : 'Voice input'}
              >
                {voiceState.isListening ? '🎤 🔴' : '🎤'}
              </Button>
            )}

            {/* Connectors Toggle Button */}
            <ChatConnectorsButton />

            <div className="flex-1 relative">
              {voiceState.isListening && (
                <div
                  className="absolute -top-8 left-0 px-3 py-1 rounded-lg text-xs font-medium animate-pulse"
                  style={{ backgroundColor: theme.error, color: '#fff' }}
                >
                  🎤 Listening... Speak now
                </div>
              )}
              <textarea
                placeholder={voiceState.supported ? "Type your message or click 🎤 to speak..." : "Type your message... (Shift+Enter for new line)"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                className="w-full resize-none rounded-lg px-4 py-3 text-sm"
                style={{
                  backgroundColor: theme.input,
                  color: theme.text,
                  border: `1px solid ${voiceState.isListening ? theme.error : theme.border}`,
                  outline: 'none',
                  minHeight: '44px',
                  maxHeight: '200px',
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? '⏳' : '➤'}
            </Button>
          </div>

          <div className="flex justify-center gap-4 mt-2 text-xs" style={{ color: theme.textMuted }}>
            <span>Press Enter to send</span>
            <span>•</span>
            <span>Shift+Enter for new line</span>
            <span>•</span>
            <span>Ctrl+K for quick actions</span>
          </div>
        </div>
      </div>

      {/* Agent Panel (optional) */}
      {showAgentPanel && (
        <div
          className="w-80 flex flex-col"
          style={{
            backgroundColor: theme.panel,
            borderLeft: `1px solid ${theme.border}`,
          }}
        >
          <div className="p-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <h3 className="font-semibold" style={{ color: theme.text }}>Agent Controls</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card title="Active Agent">
              {activeAgent ? (
                <div>
                  <div className="font-medium" style={{ color: theme.text }}>
                    {activeAgent.name}
                  </div>
                  <div className="text-sm" style={{ color: theme.textMuted }}>
                    {activeAgent.description}
                  </div>
                </div>
              ) : (
                <div style={{ color: theme.textMuted }}>No agent selected</div>
              )}
            </Card>

            <Card title="Tools">
              <div className="space-y-2">
                {['Web Search', 'File Access', 'Code Execution', 'API Calls'].map(tool => (
                  <label key={tool} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm" style={{ color: theme.text }}>{tool}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card title="Memory">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm" style={{ color: theme.text }}>Session memory</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm" style={{ color: theme.text }}>Project context</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm" style={{ color: theme.text }}>Global knowledge</span>
                </label>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== AGENTS VIEW ====================

const AgentsView = () => {
  const { agents, addAgent, removeAgent, setActiveAgent, currentTheme, agentWorkflows, addWorkflow } = useAionStore();
  const theme = themes[currentTheme];
  const workflows = agentWorkflows || [];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', description: '', instructions: '', tools: [] });

  const availableTools = [
    { id: 'web_search', name: 'Web Search', icon: '🔍' },
    { id: 'file_access', name: 'File Access', icon: '📁' },
    { id: 'code_exec', name: 'Code Execution', icon: '💻' },
    { id: 'api_calls', name: 'API Calls', icon: '🔌' },
    { id: 'memory', name: 'Memory Access', icon: '🧠' },
    { id: 'browser', name: 'Browser Control', icon: '🌐' },
  ];

  const handleCreateAgent = () => {
    if (newAgent.name && newAgent.description) {
      addAgent({
        ...newAgent,
        status: 'idle',
        runs: 0,
        lastRun: null,
      });
      setNewAgent({ name: '', description: '', instructions: '', tools: [] });
      setShowCreateModal(false);
    }
  };

  const toggleTool = (toolId) => {
    setNewAgent(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(t => t !== toolId)
        : [...prev.tools, toolId]
    }));
  };

  return (
    <div className="flex h-full">
      {/* Agents List */}
      <div
        className="w-80 flex flex-col"
        style={{
          backgroundColor: theme.panel,
          borderRight: `1px solid ${theme.border}`,
        }}
      >
        <div className="p-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: theme.text }}>Agents</h2>
            <Badge variant="secondary">{agents.length}</Badge>
          </div>
          <Button variant="primary" className="w-full" onClick={() => setShowCreateModal(true)}>
            + Create Agent
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {agents.length === 0 && (
            <div className="p-4 text-center" style={{ color: theme.textMuted }}>
              <div className="text-4xl mb-2">🤖</div>
              <p className="text-sm">No agents yet. Create your first agent!</p>
            </div>
          )}

          {agents.map(agent => (
            <Card
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              hover={true}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
                  >
                    🤖
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: theme.text }}>
                      {agent.name}
                    </div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>
                      {agent.status} • {agent.runs} runs
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeAgent(agent.id); }}
                  className="text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: theme.error }}
                >
                  ×
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {agent.tools.slice(0, 3).map(toolId => {
                  const tool = availableTools.find(t => t.id === toolId);
                  return tool ? (
                    <span
                      key={toolId}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: theme.panel, color: theme.textMuted }}
                    >
                      {tool.icon}
                    </span>
                  ) : null;
                })}
                {agent.tools.length > 3 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: theme.panel, color: theme.textMuted }}
                  >
                    +{agent.tools.length - 3}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Agent Details / Builder */}
      <div className="flex-1 overflow-y-auto p-6">
        {agents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center" style={{ color: theme.textMuted }}>
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: theme.text }}>
              Agent Builder
            </h3>
            <p className="text-center max-w-md mb-6">
              Create AI agents with custom instructions, tools, and workflows.
              Deploy them to automate tasks.
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Agent
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: theme.text }}>
                  🤖 Agent Builder
                </h2>
                <p style={{ color: theme.textMuted }}>
                  Create and configure AI agents for specific tasks
                </p>
              </div>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                + New Agent
              </Button>
            </div>

            {/* Quick Templates */}
            <Card title="Quick Templates">
              <div className="grid grid-cols-3 gap-3">
                {['Research Assistant', 'Code Reviewer', 'Data Analyst', 'Content Writer', 'Bug Hunter', 'DevOps Helper'].map(template => (
                  <div
                    key={template}
                    className="p-3 rounded-lg cursor-pointer transition-all text-center"
                    style={{
                      backgroundColor: theme.panel,
                      border: `1px solid ${theme.border}`,
                      color: theme.text,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.accent;
                      e.currentTarget.style.backgroundColor = theme.panelHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = theme.border;
                      e.currentTarget.style.backgroundColor = theme.panel;
                    }}
                  >
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-sm font-medium">{template}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Workflows */}
            <Card title="Recent Workflows">
              <div className="space-y-2">
                {workflows.length === 0 ? (
                  <div className="p-4 text-center text-sm" style={{ color: theme.textMuted }}>
                    No workflows yet. Create an agent and run it to see workflows here.
                  </div>
                ) : (
                  workflows.map(workflow => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: theme.panel }}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="success">✓</Badge>
                        <span className="text-sm" style={{ color: theme.text }}>
                          {workflow.name}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: theme.textMuted }}>
                        {new Date(workflow.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: theme.text }}>
                Create New Agent
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-2xl"
                style={{ color: theme.textMuted }}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Agent Name
                </label>
                <Input
                  placeholder="e.g., Research Assistant"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Description
                </label>
                <Input
                  placeholder="What does this agent do?"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Instructions (System Prompt)
                </label>
                <textarea
                  placeholder="Detailed instructions for the agent..."
                  value={newAgent.instructions}
                  onChange={(e) => setNewAgent({ ...newAgent, instructions: e.target.value })}
                  rows={4}
                  className="w-full resize-none rounded-lg px-4 py-3 text-sm"
                  style={{
                    backgroundColor: theme.input,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Tools
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTools.map(tool => (
                    <label
                      key={tool.id}
                      className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all"
                      style={{
                        backgroundColor: newAgent.tools.includes(tool.id) ? theme.accent + '20' : theme.input,
                        border: `1px solid ${newAgent.tools.includes(tool.id) ? theme.accent : theme.border}`,
                        color: theme.text,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={newAgent.tools.includes(tool.id)}
                        onChange={() => toggleTool(tool.id)}
                        className="rounded"
                      />
                      <span>{tool.icon}</span>
                      <span className="text-sm">{tool.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateAgent}>
                Create Agent
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== PROJECTS VIEW ====================

const ProjectsView = () => {
  const { projects, addProject, removeProject, setActiveProject, currentTheme } = useAionStore();
  const theme = themes[currentTheme];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', instructions: '', context: '' });
  const [viewMode, setViewMode] = useState('grid');

  const handleCreate = () => {
    if (newProject.name) {
      addProject({
        ...newProject,
        status: 'active',
        chats: [],
        files: [],
        agents: [],
      });
      setNewProject({ name: '', description: '', instructions: '', context: '' });
      setShowCreateModal(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: theme.header,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-lg" style={{ color: theme.text }}>Projects</h2>
          <Badge variant="secondary">{projects.length}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: theme.panel }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm transition-all ${viewMode === 'grid' ? 'font-medium' : ''}`}
              style={{
                backgroundColor: viewMode === 'grid' ? theme.accent : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : theme.textMuted,
              }}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm transition-all ${viewMode === 'list' ? 'font-medium' : ''}`}
              style={{
                backgroundColor: viewMode === 'list' ? theme.accent : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : theme.textMuted,
              }}
            >
              ☰ List
            </button>
          </div>

          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + New Project
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      <div className="flex-1 overflow-y-auto p-6">
        {projects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center" style={{ color: theme.textMuted }}>
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: theme.text }}>
              No Projects Yet
            </h3>
            <p className="text-center max-w-md mb-6">
              Projects help you organize chats, files, and agents for specific workflows.
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
            {projects.map(project => (
              <Card
                key={project.id}
                onClick={() => setActiveProject(project)}
                className={viewMode === 'list' ? 'flex items-center justify-between' : ''}
              >
                <div className={viewMode === 'list' ? 'flex items-center gap-4 flex-1' : ''}>
                  <div
                    className={`${viewMode === 'grid' ? 'w-12 h-12 mb-3' : 'w-10 h-10'} rounded-xl flex items-center justify-center text-2xl`}
                    style={{ backgroundColor: theme.accent + '20' }}
                  >
                    📁
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: theme.text }}>
                      {project.name}
                    </div>
                    <div className={`text-sm truncate ${viewMode === 'grid' ? 'mt-1' : ''}`} style={{ color: theme.textMuted }}>
                      {project.description || 'No description'}
                    </div>

                    {viewMode === 'grid' && (
                      <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: theme.textMuted }}>
                        <span>💬 {project.chats?.length || 0} chats</span>
                        <span>📄 {project.files?.length || 0} files</span>
                        <span>🤖 {project.agents?.length || 0} agents</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                    {project.status}
                  </Badge>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeProject(project.id); }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: theme.error }}
                  >
                    🗑️
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            className="w-full max-w-lg rounded-2xl p-6"
            style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}` }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>
              New Project
            </h2>

            <div className="space-y-4">
              <Input
                placeholder="Project name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              />
              <Input
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
              <textarea
                placeholder="Context / Instructions for AI"
                value={newProject.context}
                onChange={(e) => setNewProject({ ...newProject, context: e.target.value })}
                rows={3}
                className="w-full resize-none rounded-lg px-4 py-3 text-sm"
                style={{
                  backgroundColor: theme.input,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== LIBRARY VIEW ====================

const LibraryView = () => {
  const { library, addLibraryItem, removeLibraryItem, currentTheme } = useAionStore();
  const theme = themes[currentTheme];
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'document', label: 'Documents', icon: '📄' },
    { id: 'url', label: 'URLs', icon: '🔗' },
    { id: 'note', label: 'Notes', icon: '📝' },
    { id: 'ai', label: 'AI Output', icon: '🤖' },
  ];

  const filteredItems = library.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: theme.header,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg" style={{ color: theme.text }}>Knowledge Library</h2>
          <Button variant="primary">+ Add Item</Button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg px-4 py-2 pl-10 text-sm"
              style={{
                backgroundColor: theme.input,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            />
            <span className="absolute left-3 top-2.5" style={{ color: theme.textMuted }}>🔍</span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: theme.panel }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-3 py-1.5 rounded text-sm transition-all flex items-center gap-1 ${filter === cat.id ? 'font-medium' : ''}`}
                style={{
                  backgroundColor: filter === cat.id ? theme.accent : 'transparent',
                  color: filter === cat.id ? '#ffffff' : theme.textMuted,
                }}
              >
                <span>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Library Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {library.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center" style={{ color: theme.textMuted }}>
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: theme.text }}>
              Knowledge Library
            </h3>
            <p className="text-center max-w-md mb-6">
              Store documents, URLs, notes, and AI outputs. Use them to provide context to agents.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary">📄 Upload Document</Button>
              <Button variant="secondary">🔗 Add URL</Button>
              <Button variant="secondary">📝 Create Note</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="group">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: theme.accent + '20' }}
                  >
                    {categories.find(c => c.id === item.type)?.icon || '📄'}
                  </div>
                  <button
                    onClick={() => removeLibraryItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: theme.error }}
                  >
                    ×
                  </button>
                </div>

                <h4 className="font-medium text-sm mb-1 truncate" style={{ color: theme.text }}>
                  {item.title}
                </h4>
                <p className="text-xs line-clamp-2" style={{ color: theme.textMuted }}>
                  {item.content || item.url || 'No content'}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  {item.tags?.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: theme.panel, color: theme.textMuted }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <span className="text-xs" style={{ color: theme.textMuted }}>
                    {new Date(item.addedAt).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm">
                    Use in Agent
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== INTEGRATIONS VIEW ====================

const IntegrationsView = () => {
  const { integrations, setIntegration, currentTheme, addNotification } = useAionStore();
  const theme = themes[currentTheme];
  const [apiKeys, setApiKeys] = useState({});

  const integrationsList = [
    { id: 'gmail', name: 'Gmail', icon: '📧', description: 'Send and read emails', color: '#EA4335' },
    { id: 'github', name: 'GitHub', icon: '🐙', description: 'Repository management', color: '#333' },
    { id: 'slack', name: 'Slack', icon: '💬', description: 'Team messaging', color: '#4A154B' },
    { id: 'notion', name: 'Notion', icon: '📝', description: 'Docs and databases', color: '#000' },
    { id: 'drive', name: 'Google Drive', icon: '📁', description: 'Cloud storage', color: '#4285F4' },
    { id: 'outlook', name: 'Outlook', icon: '📨', description: 'Email and calendar', color: '#0078D4' },
    { id: 'discord', name: 'Discord', icon: '🎮', description: 'Community chat', color: '#5865F2' },
    { id: 'jira', name: 'Jira', icon: '📋', description: 'Issue tracking', color: '#0052CC' },
  ];

  const apiProviders = ['OpenAI', 'Gemini', 'HuggingFace', 'OpenRouter', 'NVIDIA'];

  const handleSaveApiKey = async (provider) => {
    const apiKey = apiKeys[provider] || '';
    if (!apiKey.trim()) {
      alert(`Enter a ${provider} API key first.`);
      return;
    }

    if (!window.electron?.credentials) {
      alert('Secure credential storage is not available in this runtime.');
      return;
    }

    const account = provider.toLowerCase();
    const result = await window.electron.credentials.store({
      service: 'aion-os',
      account,
      password: apiKey.trim(),
    });

    if (result?.success) {
      setApiKeys(prev => ({ ...prev, [provider]: '' }));
      addNotification?.({ type: 'success', message: `${provider} API key saved` });
      alert(`${provider} API key saved securely.`);
    } else {
      alert(result?.error || `Could not save ${provider} API key.`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: theme.header,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <h2 className="font-semibold text-lg" style={{ color: theme.text }}>Integrations</h2>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Connect tools to enable agent actions
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
          {integrationsList.map(integration => {
            const isConnected = integrations[integration.id]?.connected;

            return (
              <Card key={integration.id} className="relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: integration.color }}
                />

                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: integration.color + '20' }}
                  >
                    {integration.icon}
                  </div>

                  <Badge variant={isConnected ? 'success' : 'secondary'}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>

                <h3 className="font-semibold mb-1" style={{ color: theme.text }}>
                  {integration.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: theme.textMuted }}>
                  {integration.description}
                </p>

                <Button
                  variant={isConnected ? 'secondary' : 'primary'}
                  className="w-full"
                  onClick={() => setIntegration(integration.id, {
                    ...integrations[integration.id],
                    connected: !isConnected
                  })}
                >
                  {isConnected ? '⚙️ Configure' : '🔗 Connect'}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* API Keys Section */}
        <Card title="API Keys" className="max-w-5xl mx-auto mt-6">
          <div className="space-y-3">
            {apiProviders.map(provider => (
              <div
                key={provider}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: theme.panel }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔑</span>
                  <span className="font-medium" style={{ color: theme.text }}>{provider}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    placeholder={`Enter ${provider} API key`}
                    value={apiKeys[provider] || ''}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                    className="w-64 px-3 py-1.5 rounded text-sm"
                    style={{
                      backgroundColor: theme.input,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                    }}
                  />
                  <Button variant="secondary" size="sm" onClick={() => handleSaveApiKey(provider)}>Save</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== HISTORY VIEW ====================

const HistoryView = () => {
  const { taskHistory, currentTheme, messages } = useAionStore();
  const theme = themes[currentTheme];
  const [filter, setFilter] = useState('all');

  const allHistory = [
    ...taskHistory.map(t => ({ ...t, type: 'task' })),
    ...messages.filter(m => m.role === 'user').map(m => ({ ...m, type: 'chat' })),
  ].sort((a, b) => new Date(b.timestamp || b.completedAt) - new Date(a.timestamp || a.completedAt));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: theme.header,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <h2 className="font-semibold text-lg" style={{ color: theme.text }}>History</h2>

        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: theme.panel }}>
          {['all', 'tasks', 'chats'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm capitalize transition-all ${filter === f ? 'font-medium' : ''}`}
              style={{
                backgroundColor: filter === f ? theme.accent : 'transparent',
                color: filter === f ? '#ffffff' : theme.textMuted,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-2">
          {allHistory.length === 0 ? (
            <div className="text-center py-12" style={{ color: theme.textMuted }}>
              <div className="text-4xl mb-2">🕐</div>
              <p>No history yet</p>
            </div>
          ) : (
            allHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all"
                style={{
                  backgroundColor: theme.panel,
                  border: `1px solid ${theme.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
                >
                  {item.type === 'task' ? '⚡' : '💬'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: theme.text }}>
                    {item.name || item.text || 'Untitled'}
                  </div>
                  <div className="text-sm" style={{ color: theme.textMuted }}>
                    {new Date(item.timestamp || item.completedAt).toLocaleString()}
                  </div>
                </div>

                <Badge variant={item.type === 'task' ? 'success' : 'secondary'}>
                  {item.type}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== TOP BAR ====================

const TopBar = () => {
  const {
    isAutonomousMode,
    toggleAutonomous,
    agentStatus,
    activeProject,
    currentTheme,
    notifications,
    removeNotification,
  } = useAionStore();
  const theme = themes[currentTheme];

  const handleWindowControl = (action) => {
    window.electron?.send('window-control', action);
  };

  return (
    <div
      className="h-12 flex items-center justify-between px-4"
      style={{
        backgroundColor: theme.header,
        borderBottom: `1px solid ${theme.border}`,
        WebkitAppRegion: 'drag',
      }}
    >
      {/* Left - Status */}
      <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
        {activeProject && (
          <div className="flex items-center gap-2">
            <Badge variant="primary">📁 {activeProject.name}</Badge>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${agentStatus === 'active' ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: agentStatus === 'active' ? theme.success :
                              agentStatus === 'thinking' ? theme.warning : theme.textMuted,
            }}
          />
          <span className="text-sm" style={{ color: theme.textMuted }}>
            Agent {agentStatus}
          </span>
        </div>
      </div>

      {/* Center - Autonomous Toggle */}
      <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={toggleAutonomous}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            isAutonomousMode ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundColor: isAutonomousMode ? theme.warning + '30' : theme.panel,
            color: isAutonomousMode ? theme.warning : theme.textMuted,
            border: `1px solid ${isAutonomousMode ? theme.warning : theme.border}`,
          }}
        >
          <span>{isAutonomousMode ? '⚡' : '⏸'}</span>
          <span>{isAutonomousMode ? 'Autonomous' : 'Manual'}</span>
        </button>
      </div>

      {/* Right - Notifications & Controls */}
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-lg transition-colors relative"
            style={{ color: theme.icon }}
            onMouseEnter={(e) => e.target.style.color = theme.iconHover}
            onMouseLeave={(e) => e.target.style.color = theme.icon}
          >
            🔔
            {notifications.length > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                style={{ backgroundColor: theme.error, color: '#fff' }}
              >
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => handleWindowControl('minimize')}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: theme.icon }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = theme.panel; e.target.style.color = theme.iconHover; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = theme.icon; }}
          >
            −
          </button>
          <button
            onClick={() => handleWindowControl('maximize')}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: theme.icon }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = theme.panel; e.target.style.color = theme.iconHover; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = theme.icon; }}
          >
            □
          </button>
          <button
            onClick={() => handleWindowControl('close')}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: theme.icon }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = theme.error; e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = theme.icon; }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== JAN AI VIEW ====================

const JanAIView = () => {
  const {
    janModels,
    downloadJanModel,
    resetJanDownload,
    localAIStatus,
    checkLocalAI,
    updateSettings,
    currentTheme
  } = useAionStore();
  const theme = themes[currentTheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [modelCategory, setModelCategory] = useState('all');
  const [installing, setInstalling] = useState(false);
  const [turboQuants, setTurboQuants] = useState([]);
  const [catalogModels, setCatalogModels] = useState([]);
  const [pcCapabilities, setPcCapabilities] = useState(null);
  const [downloadState, setDownloadState] = useState({});
  const [janEngine, setJanEngine] = useState(null);
  const [janEngineModels, setJanEngineModels] = useState([]);
  const [servingModel, setServingModel] = useState(null);
  const [installerState, setInstallerState] = useState(null);

  useEffect(() => {
    checkLocalAI();
    refreshJanEngine();
    loadModelCatalog();
    if (window.electron?.local?.jan?.turboquants) {
      window.electron.local.jan.turboquants().then(result => {
        if (result?.success) setTurboQuants(result.models || []);
      });
    }
    const interval = setInterval(checkLocalAI, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadModelCatalog();
  }, [searchQuery, modelCategory]);

  const loadModelCatalog = async () => {
    if (!window.electron?.local?.models) return;
    const result = await window.electron.local.models.search({ query: searchQuery, category: modelCategory });
    if (result?.success) {
      setCatalogModels(result.models || []);
      setPcCapabilities(result.capabilities || null);
    }
  };

  const refreshJanEngine = async () => {
    if (!window.electron?.local?.jan?.engine) return;
    const status = await window.electron.local.jan.engine.status();
    setJanEngine(status || null);
    const modelsResult = await window.electron.local.jan.engine.models();
    if (modelsResult?.success) {
      setJanEngineModels(modelsResult.models || []);
    }
  };

  const filteredModels = janModels.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (modelId) => {
    downloadJanModel(modelId);
    try {
      if (window.electron?.app) {
        await window.electron.app.open({ appName: 'jan' });
      }
      alert('Jan is opening. Use Jan Hub to download the selected model, then click Refresh Models here.');
    } finally {
      resetJanDownload(modelId);
      checkLocalAI();
    }
  };

  const handleDirectDownload = async (model) => {
    if (!localAIStatus.ollama.running) {
      alert('Start Ollama first. Aion uses Ollama pull for direct in-app model downloads, then it can use the model in chat.');
      return;
    }

    setDownloadState(prev => ({ ...prev, [model.id]: 'downloading' }));
    const result = await window.electron.local.ollama.pull({ model: model.pullName });
    if (result?.success) {
      updateSettings({ defaultModel: 'ollama', ollamaModel: model.pullName });
      await checkLocalAI();
      setDownloadState(prev => ({ ...prev, [model.id]: 'ready' }));
      alert(`${model.name} downloaded and selected for chat.`);
    } else {
      setDownloadState(prev => ({ ...prev, [model.id]: 'error' }));
      alert(result?.error || `Could not download ${model.name}.`);
    }
  };

  const handleUseOllamaModel = (modelName) => {
    updateSettings({ defaultModel: 'ollama', ollamaModel: modelName });
    alert(`${modelName} selected for chat.`);
  };

  const handleUseJanModel = (modelName) => {
    updateSettings({ defaultModel: 'jan', janModel: modelName });
    alert(`${modelName} selected for chat.`);
  };

  const handleServeJanModel = async (modelName) => {
    setServingModel(modelName);
    const result = await window.electron.local.jan.engine.serve({ model: modelName, fit: true, detach: true });
    setServingModel(null);
    if (result?.success) {
      updateSettings({ defaultModel: 'jan', janModel: modelName });
      await refreshJanEngine();
      await checkLocalAI();
      alert(`${modelName} is being served by Aion Jan Engine.`);
    } else {
      alert(result?.error || `Could not serve ${modelName}.`);
    }
  };

  const handleSyncJanCli = async () => {
    const result = await window.electron.local.jan.engine.syncCli();
    if (result?.success) {
      await refreshJanEngine();
      alert(`Jan CLI copied into Aion:\n${result.dest}`);
    } else {
      alert(result?.error || 'No Jan CLI binary found to copy.');
    }
  };

  const handleDownloadJanInstaller = async () => {
    setInstallerState('downloading');
    const result = await window.electron.local.jan.engine.downloadInstaller();
    setInstallerState(null);
    if (result?.success) {
      await window.electron.local.jan.engine.runInstaller({ installerPath: result.path });
      alert(`Jan installer downloaded:\n${result.path}\n\nRun it, open Jan once, enable/install Jan CLI in Jan Settings, then click Sync CLI.`);
    } else {
      alert(result?.error || 'Could not download Jan installer.');
    }
  };

  const handleInstallJan = () => {
    // Open Jan download page
    if (window.electron && window.electron.app) {
      window.electron.app.open({ appName: 'jan' });
    } else {
      window.open('https://jan.ai/download', '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: theme.header,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg" style={{ color: theme.text }}>
              📦 Jan AI - Local Model Hub
            </h2>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Download and run open-source AI models locally
            </p>
          </div>

          {!localAIStatus.jan.installed ? (
            <Button
              variant="primary"
              onClick={handleInstallJan}
              disabled={installing}
            >
              {installing ? '⏳ Installing...' : '⬇️ Install Jan'}
            </Button>
          ) : (
            <Badge variant="success">
              <span className="mr-1">✓</span> Jan Installed
            </Badge>
          )}
          <Button variant="secondary" size="sm" onClick={checkLocalAI}>
            🔄 Refresh Models
          </Button>
          <Button variant="secondary" size="sm" onClick={refreshJanEngine}>
            🧩 Jan Engine
          </Button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: localAIStatus.ollama.running ? theme.success + '20' : theme.panel,
              border: `1px solid ${localAIStatus.ollama.running ? theme.success : theme.border}`,
            }}
          >
            <span className="text-sm">🦙 Ollama:</span>
            <Badge variant={localAIStatus.ollama.running ? 'success' : 'secondary'}>
              {localAIStatus.ollama.running ? 'Running' : 'Not Detected'}
            </Badge>
            {localAIStatus.ollama.running && (
              <span className="text-xs" style={{ color: theme.textMuted }}>
                {localAIStatus.ollama.models.length} models
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: localAIStatus.lmStudio.running ? theme.success + '20' : theme.panel,
              border: `1px solid ${localAIStatus.lmStudio.running ? theme.success : theme.border}`,
            }}
          >
            <span className="text-sm">🧠 LM Studio:</span>
            <Badge variant={localAIStatus.lmStudio.running ? 'success' : 'secondary'}>
              {localAIStatus.lmStudio.running ? 'Running' : 'Not Detected'}
            </Badge>
            {localAIStatus.lmStudio.running && (
              <span className="text-xs" style={{ color: theme.textMuted }}>
                {localAIStatus.lmStudio.models.length} models
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: localAIStatus.jan.running ? theme.success + '20' : theme.panel,
              border: `1px solid ${localAIStatus.jan.running ? theme.success : theme.border}`,
            }}
          >
            <span className="text-sm">📦 Jan:</span>
            <Badge variant={localAIStatus.jan.running ? 'success' : 'secondary'}>
              {localAIStatus.jan.running ? 'Running' : localAIStatus.jan.installed ? 'Installed' : 'Not Installed'}
            </Badge>
            {localAIStatus.jan.embedded && <Badge variant="success">Embedded</Badge>}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="flex items-center gap-3">
          <div className="relative max-w-md flex-1">
            <input
              type="text"
              placeholder="Search local models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg px-4 py-2 pl-10 text-sm"
              style={{
                backgroundColor: theme.input,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            />
            <span className="absolute left-3 top-2.5" style={{ color: theme.textMuted }}>🔍</span>
          </div>
          <select
            value={modelCategory}
            onChange={(e) => setModelCategory(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
          >
            <option value="all">All</option>
            <option value="Fast">Fast</option>
            <option value="Balanced">Balanced</option>
            <option value="Coding">Coding</option>
            <option value="Vision">Vision</option>
            <option value="Large">Large</option>
          </select>
        </div>
      </div>

      {/* Models Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card title="Aion Jan Engine" className="max-w-5xl mx-auto mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-sm font-medium" style={{ color: theme.text }}>
                {janEngine?.installed ? (janEngine.embedded ? 'Embedded Jan CLI detected' : 'System Jan CLI detected') : 'Embedded Jan CLI not installed'}
              </div>
              <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
                {janEngine?.binary || 'Expected path: aion-os/bin/jan/jan.exe'}
              </div>
              <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
                API: {janEngine?.apiRunning ? `running at ${janEngine.preferredHost}` : 'not running'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={janEngine?.installed ? 'success' : 'warning'}>
                {janEngine?.installed ? 'Engine Ready' : 'Needs Binary'}
              </Badge>
              <Button variant="secondary" size="sm" onClick={() => window.electron?.local?.jan?.engine?.openFolder?.()}>
                📁 Engine Folder
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSyncJanCli}>
                🔁 Sync CLI
              </Button>
              <Button variant="primary" size="sm" disabled={installerState === 'downloading'} onClick={handleDownloadJanInstaller}>
                {installerState === 'downloading' ? 'Downloading...' : '⬇️ Get Jan'}
              </Button>
            </div>
          </div>

          {janEngineModels.length > 0 ? (
            <div className="space-y-2">
              {janEngineModels.map((model, idx) => (
                <div
                  key={`${model.id}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: theme.panel }}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={model.engine === 'aion-jan' ? 'success' : 'primary'}>
                      {model.engine === 'aion-jan' ? 'Aion Jan' : 'Jan'}
                    </Badge>
                    <span className="text-sm font-medium" style={{ color: theme.text }}>{model.name || model.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleUseJanModel(model.id)}>
                      Use
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!janEngine?.installed || servingModel === model.id}
                      onClick={() => handleServeJanModel(model.id)}
                    >
                      {servingModel === model.id ? 'Serving...' : 'Serve'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: theme.panel, color: theme.textMuted }}>
              Add Jan CLI to the engine folder and add GGUF models through Jan/Jan CLI. Aion will serve and use them from here.
            </div>
          )}
        </Card>

        {pcCapabilities && (
          <Card title="This PC" className="max-w-5xl mx-auto mb-6">
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                <div style={{ color: theme.textMuted }}>RAM</div>
                <div className="font-semibold" style={{ color: theme.text }}>{formatBytes(pcCapabilities.totalRamBytes)}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                <div style={{ color: theme.textMuted }}>Free RAM</div>
                <div className="font-semibold" style={{ color: theme.text }}>{formatBytes(pcCapabilities.freeRamBytes)}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                <div style={{ color: theme.textMuted }}>VRAM</div>
                <div className="font-semibold" style={{ color: theme.text }}>{formatBytes(pcCapabilities.totalVramBytes)}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                <div style={{ color: theme.textMuted }}>CPU</div>
                <div className="font-semibold truncate" style={{ color: theme.text }}>{pcCapabilities.cpuCores} cores</div>
              </div>
            </div>
            {pcCapabilities.gpus?.length > 0 && (
              <div className="mt-3 text-xs" style={{ color: theme.textMuted }}>
                {pcCapabilities.gpus.map(gpu => `${gpu.name} (${formatBytes(gpu.vramBytes)})`).join(' • ')}
              </div>
            )}
          </Card>
        )}

        <Card title="Search & Download Local Models" className="max-w-5xl mx-auto mb-6">
          <div className="grid grid-cols-2 gap-3">
            {catalogModels.map(model => {
              const fit = getFitBadge(model.fit);
              const installed = localAIStatus.ollama.models.some(m => (m.name || m.model) === model.pullName);
              const status = downloadState[model.id];
              return (
                <div
                  key={model.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: theme.text }}>{model.name}</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>{model.description}</div>
                    </div>
                    <Badge variant={fit.variant}>{fit.label}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-3" style={{ color: theme.textMuted }}>
                    <span>{formatBytes(model.sizeBytes)}</span>
                    <span>•</span>
                    <span>{model.parameters}</span>
                    <span>•</span>
                    <span>{model.quant}</span>
                    <span>•</span>
                    <span>Needs {formatBytes(model.minRamBytes)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {installed ? (
                      <Button variant="secondary" size="sm" onClick={() => handleUseOllamaModel(model.pullName)}>
                        ▶️ Use
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={status === 'downloading' || model.fit === 'too-large'}
                        onClick={() => handleDirectDownload(model)}
                      >
                        {status === 'downloading' ? '⏳ Downloading' : '⬇️ Download'}
                      </Button>
                    )}
                    <Badge variant="secondary">{model.pullName}</Badge>
                  </div>
                </div>
              );
            })}
            {catalogModels.length === 0 && (
              <div className="p-4 text-sm" style={{ color: theme.textMuted }}>
                No matching local models found.
              </div>
            )}
          </div>
        </Card>

        {turboQuants.length > 0 && (
          <Card title="TurboQuants" className="max-w-5xl mx-auto mb-6">
            <div className="grid grid-cols-2 gap-3">
              {turboQuants.map(profile => (
                <div
                  key={profile.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: theme.panel, border: `1px solid ${theme.border}` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: theme.text }}>{profile.name}</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>{profile.target}</div>
                    </div>
                    <Badge variant="primary">{profile.quant}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                    <span>RAM {profile.ram}</span>
                    <span>•</span>
                    <span>{profile.speed}</span>
                    <span>•</span>
                    <span>{profile.baseModel}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
          {filteredModels.map(model => (
            <Card key={model.id} className="relative overflow-hidden">
              {/* Status Indicator */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  backgroundColor: model.downloaded ? theme.success :
                                   model.downloading ? theme.warning : theme.border
                }}
              />

              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: theme.accent + '20' }}
                >
                  {model.category === 'Coding' ? '💻' : model.category === 'Vision' ? '👁️' : '🤖'}
                </div>

                {model.downloaded ? (
                  <Badge variant="success">✓ Downloaded</Badge>
                ) : model.downloading ? (
                  <Badge variant="warning">⬇️ Downloading...</Badge>
                ) : (
                  <Badge variant="secondary">{model.category}</Badge>
                )}
              </div>

              <h3 className="font-semibold mb-1" style={{ color: theme.text }}>
                {model.name}
              </h3>
              <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                {model.description}
              </p>
              <p className="text-sm mb-3" style={{ color: theme.textMuted }}>
                Size: {model.size}
              </p>

              {model.downloading && (
                <div className="mb-3">
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: theme.panel }}
                  >
                    <div
                      className="h-full rounded-full animate-pulse"
                      style={{
                        backgroundColor: theme.warning,
                        width: '60%',
                      }}
                    />
                  </div>
                </div>
              )}

              <Button
                variant={model.downloaded ? 'secondary' : 'primary'}
                className="w-full"
                onClick={() => !model.downloaded && !model.downloading && handleDownload(model.id)}
                disabled={model.downloading}
              >
                {model.downloaded ? '▶️ Open in Jan' : model.downloading ? '⏳ Opening Jan...' : '⬇️ Open in Jan Hub'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Local Models Info */}
        <Card title="Your Local Models" className="max-w-5xl mx-auto mt-6">
          <div className="space-y-2">
            {localAIStatus.ollama.models.length === 0 && localAIStatus.lmStudio.models.length === 0 && localAIStatus.jan.models.length === 0 ? (
              <div className="p-4 text-center text-sm" style={{ color: theme.textMuted }}>
                No local models detected. Install Jan, Ollama, or LM Studio to see your models here.
              </div>
            ) : (
              <>
                {localAIStatus.ollama.models.map((m, idx) => (
                  <div
                    key={`ollama-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: theme.panel }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="primary">🦙 Ollama</Badge>
                      <span className="text-sm font-medium" style={{ color: theme.text }}>
                        {m.name}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleUseOllamaModel(m.name || m.model)}>
                      ▶️ Use
                    </Button>
                  </div>
                ))}
                {localAIStatus.lmStudio.models.map((m, idx) => (
                  <div
                    key={`lmstudio-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: theme.panel }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="primary">🧠 LM Studio</Badge>
                      <span className="text-sm font-medium" style={{ color: theme.text }}>
                        {m.id || m.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateSettings({ defaultModel: 'lmstudio', lmStudioModel: m.id || m.name });
                        alert(`${m.id || m.name} selected for chat.`);
                      }}
                    >
                      ▶️ Use
                    </Button>
                  </div>
                ))}
                {localAIStatus.jan.models.map((m, idx) => (
                  <div
                    key={`jan-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: theme.panel }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="primary">📦 Jan</Badge>
                      <span className="text-sm font-medium" style={{ color: theme.text }}>
                        {m.id || m.name}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleUseJanModel(m.id || m.name)}>
                      ▶️ Use
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== UK SERVICES VIEW ====================

const UKServicesView = () => {
  const {
    ukServices,
    toggleUKService,
    updateUKService,
    integrations,
    setIntegration,
    currentTheme
  } = useAionStore();
  const theme = themes[currentTheme];
  const [activeTab, setActiveTab] = useState('solicitor');
  const [emails, setEmails] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [newEmail, setNewEmail] = useState({ to: '', subject: '', body: '', category: '' });
  const [mailSource, setMailSource] = useState('outlook');

  const services = {
    solicitor: {
      title: 'UK Solicitor',
      icon: '⚖️',
      description: 'Legal document management and compliance checking',
      color: '#8b5cf6',
      features: [
        'Contract review and analysis',
        'GDPR compliance checking',
        'Dispute documentation',
        'IP law research assistance',
      ],
    },
    accountant: {
      title: 'UK Accountant',
      icon: '📊',
      description: 'Financial document organization and tax assistance',
      color: '#f59e0b',
      features: [
        'VAT return organization',
        'Tax document categorization',
        'Payroll documentation',
        'Bookkeeping assistance',
      ],
    },
  };

  const currentService = services[activeTab];
  const serviceStatus = ukServices[activeTab];

  // Email management functions
  const handleSyncEmails = async () => {
    setIsSyncing(true);
    try {
      if (mailSource === 'gmail') {
        await window.electron?.email?.gmail?.open?.();
        alert('Gmail opened. Full Gmail inbox automation needs Google OAuth/API authorization.');
        return;
      }

      const result = await window.electron?.email?.outlook?.list?.({ limit: 50 });
      if (result?.success) {
        setEmails((result.messages || []).map(message => ({
          id: message.EntryID,
          from: message.SenderEmailAddress || message.SenderName,
          subject: message.Subject,
          category: message.Categories || 'Unsorted',
          date: message.ReceivedTime,
          read: !message.UnRead,
          preview: message.BodyPreview,
        })));
        setLastSync(new Date());
      } else {
        alert(result?.error || 'Could not read Outlook Classic inbox.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!newEmail.to || !newEmail.subject) {
      alert('Please fill in recipient and subject');
      return;
    }
    const result = await window.electron?.email?.outlook?.send?.({
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      displayOnly: true,
    });
    if (!result?.success) {
      alert(result?.error || 'Could not create Outlook email draft.');
      return;
    }
    alert(`Outlook draft opened for ${newEmail.to}`);
    setNewEmail({ to: '', subject: '', body: '', category: '' });
    setShowEmailCompose(false);
  };

  const organizeEmails = async () => {
    if (!serviceStatus.autoOrganize) {
      alert('Enable auto-organize first');
      return;
    }
    const result = await window.electron?.email?.outlook?.organize?.({ limit: 100 });
    if (result?.success) {
      alert(`Outlook organized ${result.updated?.length || 0} emails into Aion categories.`);
      handleSyncEmails();
    } else {
      alert(result?.error || 'Could not organize Outlook emails.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: theme.header,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <h2 className="font-semibold text-lg" style={{ color: theme.text }}>
          ⚖️ UK Professional Services
        </h2>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Automated legal and financial document management
        </p>
      </div>

      {/* Service Tabs */}
      <div className="px-6 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="flex items-center gap-2">
          {Object.entries(services).map(([key, service]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === key ? 'font-medium' : ''}`}
              style={{
                backgroundColor: activeTab === key ? service.color + '20' : 'transparent',
                border: `1px solid ${activeTab === key ? service.color : theme.border}`,
                color: activeTab === key ? service.color : theme.textMuted,
              }}
            >
              <span className="text-xl">{service.icon}</span>
              <span>{service.title}</span>
              {ukServices[key].enabled && (
                <Badge variant="success" size="sm">Active</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Service Details */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Card */}
          <Card
            className="relative overflow-hidden"
            style={{ borderColor: currentService.color }}
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: currentService.color }}
            />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: currentService.color + '20' }}
                >
                  {currentService.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: theme.text }}>
                    {currentService.title}
                  </h3>
                  <p style={{ color: theme.textMuted }}>
                    {currentService.description}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm" style={{ color: theme.textMuted }}>
                  {serviceStatus.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <div
                  className={`w-12 h-6 rounded-full relative transition-colors ${serviceStatus.enabled ? '' : ''}`}
                  style={{ backgroundColor: serviceStatus.enabled ? currentService.color : theme.panel }}
                  onClick={() => toggleUKService(activeTab)}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{
                      left: serviceStatus.enabled ? 'calc(100% - 1.25rem)' : '0.25rem',
                    }}
                  />
                </div>
              </label>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {currentService.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-lg"
                  style={{ backgroundColor: theme.panel }}
                >
                  <span style={{ color: currentService.color }}>✓</span>
                  <span className="text-sm" style={{ color: theme.text }}>{feature}</span>
                </div>
              ))}
            </div>

            {/* Auto-organize Toggle */}
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: theme.panel }}
            >
              <div>
                <div className="font-medium text-sm" style={{ color: theme.text }}>
                  📧 Auto-organize Emails
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>
                  Automatically categorize incoming emails by {activeTab} topics
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={serviceStatus.autoOrganize}
                  onChange={() => updateUKService(activeTab, { autoOrganize: !serviceStatus.autoOrganize })}
                  className="rounded"
                />
              </label>
            </div>
          </Card>

          {/* Email Integration */}
          <Card title="Email Integration">
            <div className="space-y-3">
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: theme.panel }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <div className="font-medium text-sm" style={{ color: theme.text }}>Gmail</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>Read and organize emails</div>
                  </div>
                </div>
                <Button
                  variant={integrations.gmail.connected ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => setIntegration('gmail', { ...integrations.gmail, connected: !integrations.gmail.connected })}
                >
                  {integrations.gmail.connected ? '✓ Connected' : '🔗 Connect'}
                </Button>
              </div>

              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: theme.panel }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">📨</span>
                  <div>
                    <div className="font-medium text-sm" style={{ color: theme.text }}>Outlook</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>Microsoft 365 integration</div>
                  </div>
                </div>
                <Button
                  variant={integrations.outlook.connected ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => setIntegration('outlook', { ...integrations.outlook, connected: !integrations.outlook.connected })}
                >
                  {integrations.outlook.connected ? '✓ Connected' : '🔗 Connect'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Email Management */}
          <Card title="Email Management">
            <div className="space-y-4">
              {/* Sync Controls */}
              <div className="flex items-center gap-3">
                <select
                  value={mailSource}
                  onChange={(e) => setMailSource(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                >
                  <option value="outlook">Outlook Classic</option>
                  <option value="gmail">Gmail Web</option>
                </select>
                <Button
                  variant="primary"
                  onClick={handleSyncEmails}
                  disabled={isSyncing}
                >
                  {isSyncing ? '🔄 Syncing...' : '🔄 Sync Emails'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={organizeEmails}
                >
                  🗂️ Organize by Category
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowEmailCompose(!showEmailCompose)}
                >
                  ✏️ Compose Email
                </Button>
                {lastSync && (
                  <span className="text-xs" style={{ color: theme.textMuted }}>
                    Last sync: {lastSync.toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Email Compose Form */}
              {showEmailCompose && (
                <div
                  className="p-4 rounded-lg space-y-3"
                  style={{ backgroundColor: theme.panel }}
                >
                  <h4 className="font-medium" style={{ color: theme.text }}>Compose New Email</h4>
                  <input
                    type="text"
                    placeholder="To:"
                    value={newEmail.to}
                    onChange={(e) => setNewEmail({...newEmail, to: e.target.value})}
                    className="w-full rounded px-3 py-2 text-sm"
                    style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                  />
                  <input
                    type="text"
                    placeholder="Subject:"
                    value={newEmail.subject}
                    onChange={(e) => setNewEmail({...newEmail, subject: e.target.value})}
                    className="w-full rounded px-3 py-2 text-sm"
                    style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                  />
                  <select
                    value={newEmail.category}
                    onChange={(e) => setNewEmail({...newEmail, category: e.target.value})}
                    className="w-full rounded px-3 py-2 text-sm"
                    style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                  >
                    <option value="">Select Category</option>
                    {serviceStatus.categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Email body..."
                    value={newEmail.body}
                    onChange={(e) => setNewEmail({...newEmail, body: e.target.value})}
                    rows={4}
                    className="w-full rounded px-3 py-2 text-sm"
                    style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={handleSendEmail}>📤 Send Email</Button>
                    <Button variant="secondary" onClick={() => setShowEmailCompose(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Email List */}
              {emails.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm" style={{ color: theme.text }}>
                    Recent Emails ({emails.length})
                  </h4>
                  {emails.map(email => (
                    <div
                      key={email.id}
                      className="p-3 rounded-lg cursor-pointer transition-all hover:opacity-80"
                      style={{
                        backgroundColor: email.read ? theme.panel : theme.accent + '10',
                        borderLeft: `3px solid ${currentService.color}`
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: theme.text }}>
                              {email.from}
                            </span>
                            {!email.read && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: currentService.color }}
                              />
                            )}
                          </div>
                          <div className="text-sm" style={{ color: theme.text }}>{email.subject}</div>
                        </div>
                        <span className="text-xs" style={{ color: theme.textMuted }}>
                          {new Date(email.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: currentService.color + '20',
                            color: currentService.color
                          }}
                        >
                          {email.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center" style={{ color: theme.textMuted }}>
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm">No emails synced yet</p>
                  <p className="text-xs mt-1">Click "Sync Emails" to fetch your emails</p>
                </div>
              )}
            </div>
          </Card>

          {/* Categories */}
          <Card title="Document Categories">
            <div className="flex flex-wrap gap-2">
              {serviceStatus.categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{
                    backgroundColor: currentService.color + '20',
                    color: currentService.color,
                    border: `1px solid ${currentService.color}40`,
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            <div className="space-y-2">
              {serviceStatus.lastSync ? (
                <div
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: theme.panel }}
                >
                  <span className="text-sm" style={{ color: theme.text }}>
                    Last synchronized: {new Date(serviceStatus.lastSync).toLocaleString()}
                  </span>
                  <Button variant="secondary" size="sm">🔄 Sync Now</Button>
                </div>
              ) : (
                <div className="p-4 text-center text-sm" style={{ color: theme.textMuted }}>
                  No activity yet. Enable the service and connect your email to start organizing documents.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==================== SKILLS VIEW ====================

const SkillsView = () => {
  const { skills, toggleSkill, setSkillLevel, currentTheme } = useAionStore();
  const theme = themes[currentTheme];

  const skillCategories = {
    core: ['writing', 'coding', 'analysis', 'reasoning'],
    automation: ['automation', 'dataExtraction'],
    multimodal: ['vision', 'audio'],
  };

  const skillLabels = {
    writing: { icon: '✍️', label: 'Writing', desc: 'Create and edit documents, emails, and content' },
    coding: { icon: '💻', label: 'Coding', desc: 'Generate, review, and debug code' },
    analysis: { icon: '📊', label: 'Analysis', desc: 'Analyze data and extract insights' },
    reasoning: { icon: '🧠', label: 'Reasoning', desc: 'Complex problem solving and logic' },
    automation: { icon: '⚙️', label: 'Automation', desc: 'Create workflows and automate tasks' },
    dataExtraction: { icon: '📥', label: 'Data Extraction', desc: 'Extract structured data from unstructured sources' },
    vision: { icon: '👁️', label: 'Vision', desc: 'Analyze images and visual content' },
    audio: { icon: '🎵', label: 'Audio', desc: 'Process and generate audio content' },
  };

  const levels = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4" style={{ backgroundColor: theme.header, borderBottom: `1px solid ${theme.border}` }}>
        <h2 className="font-semibold text-lg" style={{ color: theme.text }}>
          🎯 AI Skills & Capabilities
        </h2>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Configure what your AI assistant can do
        </p>
      </div>

      {/* Skills Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Core Skills */}
          <Card title="Core Capabilities" className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: theme.accent }}
            />
            <div className="space-y-4">
              {skillCategories.core.map(skill => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: theme.panel }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: theme.accent + '20' }}
                    >
                      {skillLabels[skill].icon}
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        {skillLabels[skill].label}
                      </div>
                      <div className="text-sm" style={{ color: theme.textMuted }}>
                        {skillLabels[skill].desc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={skills[skill].level}
                      onChange={(e) => setSkillLevel(skill, e.target.value)}
                      disabled={!skills[skill].enabled}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        backgroundColor: theme.input,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      {levels.map(l => (
                        <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="w-12 h-6 rounded-full relative transition-colors"
                      style={{ backgroundColor: skills[skill].enabled ? theme.success : theme.panel }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: skills[skill].enabled ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Automation Skills */}
          <Card title="Automation & Data" className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: theme.warning }}
            />
            <div className="space-y-4">
              {skillCategories.automation.map(skill => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: theme.panel }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: theme.warning + '20' }}
                    >
                      {skillLabels[skill].icon}
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        {skillLabels[skill].label}
                      </div>
                      <div className="text-sm" style={{ color: theme.textMuted }}>
                        {skillLabels[skill].desc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={skills[skill].level}
                      onChange={(e) => setSkillLevel(skill, e.target.value)}
                      disabled={!skills[skill].enabled}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        backgroundColor: theme.input,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      {levels.map(l => (
                        <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="w-12 h-6 rounded-full relative transition-colors"
                      style={{ backgroundColor: skills[skill].enabled ? theme.success : theme.panel }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: skills[skill].enabled ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Multimodal Skills */}
          <Card title="Multimodal (Beta)" className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: theme.error }}
            />
            <div className="p-3 mb-4 rounded-lg text-sm" style={{ backgroundColor: theme.error + '10', color: theme.error }}>
              ⚠️ Vision and Audio capabilities require additional configuration and API keys.
            </div>
            <div className="space-y-4">
              {skillCategories.multimodal.map(skill => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: theme.panel }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: theme.error + '20' }}
                    >
                      {skillLabels[skill].icon}
                    </div>
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        {skillLabels[skill].label}
                      </div>
                      <div className="text-sm" style={{ color: theme.textMuted }}>
                        {skillLabels[skill].desc}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSkill(skill)}
                    className="w-12 h-6 rounded-full relative transition-colors"
                    style={{ backgroundColor: skills[skill].enabled ? theme.success : theme.panel }}
                  >
                    <div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: skills[skill].enabled ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==================== CONNECTORS VIEW ====================

const ConnectorsView = () => {
  const { connectors, toggleConnector, activeConnectors, setActiveConnectors, currentTheme } = useAionStore();
  const theme = themes[currentTheme];
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = {
    all: 'All Connectors',
    ai: '🤖 AI Models',
    communication: '💬 Communication',
    productivity: '📁 Productivity',
    business: '💼 Business',
    dev: '🛠️ Development',
    media: '🎨 Media',
  };

  const filteredConnectors = Object.entries(connectors).filter(([key, connector]) => {
    const matchesFilter = filter === 'all' || connector.category === filter;
    const matchesSearch = connector.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const enabledCount = Object.values(connectors).filter(c => c.enabled).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4" style={{ backgroundColor: theme.header, borderBottom: `1px solid ${theme.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg" style={{ color: theme.text }}>
              🔌 Connector Marketplace
            </h2>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              Enable tools and services for your AI to use
            </p>
          </div>
          <Badge variant="primary">
            {enabledCount} / {Object.keys(connectors).length} Enabled
          </Badge>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search connectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg px-4 py-2 pl-10 text-sm"
              style={{
                backgroundColor: theme.input,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            />
            <span className="absolute left-3 top-2.5" style={{ color: theme.textMuted }}>🔍</span>
          </div>
          <div className="flex items-center gap-1">
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  backgroundColor: filter === key ? theme.accent : theme.panel,
                  color: filter === key ? '#fff' : theme.textMuted,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-4">
            {filteredConnectors.map(([key, connector]) => (
              <Card
                key={key}
                className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                onClick={() => toggleConnector(key)}
              >
                {/* Status Indicator */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: connector.enabled ? theme.success : theme.border }}
                />

                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: connector.enabled ? theme.accent + '20' : theme.panel,
                    }}
                  >
                    {connector.category === 'ai' && '🤖'}
                    {connector.category === 'communication' && '💬'}
                    {connector.category === 'productivity' && '📁'}
                    {connector.category === 'business' && '💼'}
                    {connector.category === 'dev' && '🛠️'}
                    {connector.category === 'media' && '🎨'}
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: connector.enabled ? theme.success : theme.panel,
                    }}
                  >
                    {connector.enabled ? '✓' : ''}
                  </div>
                </div>

                <h3
                  className="font-semibold mb-1 capitalize"
                  style={{ color: connector.enabled ? theme.text : theme.textMuted }}
                >
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-xs mb-2" style={{ color: theme.textMuted }}>
                  {connector.description}
                </p>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={connector.type === 'local' ? 'success' : connector.type === 'oauth' ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {connector.type}
                  </Badge>
                  {connector.enabled && (
                    <Badge variant="success" size="sm">Active</Badge>
                  )}
                </div>
                {connector.category !== 'ai' && (
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={(event) => {
                        event.stopPropagation();
                        window.electron?.app?.open({ appName: key });
                      }}
                    >
                      🌐 Open
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filteredConnectors.length === 0 && (
            <div className="p-8 text-center" style={{ color: theme.textMuted }}>
              <div className="text-4xl mb-2">🔍</div>
              <p>No connectors match your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SETTINGS VIEW ====================

const SettingsView = () => {
  const {
    account, updateAccount,
    usage, resetUsage,
    scheduledTasks, addScheduledTask, removeScheduledTask, toggleScheduledTask,
    mailToTask, updateMailToTask, addApprovedSender, removeApprovedSender, toggleApprovedSender, addWorkflowEmail,
    dataControls, updateDataControls,
    cloudBrowser, updateCloudBrowser,
    myComputer, updateMyComputer, addAllowedPath, removeAllowedPath,
    settings, updateSettings,
    personalization, updatePersonalization, setAssistantName, setAssistantPersonality,
    currentTheme
  } = useAionStore();
  const theme = themes[currentTheme];
  const [activeTab, setActiveTab] = useState('account');
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [newSenderName, setNewSenderName] = useState('');
  const [newPath, setNewPath] = useState('');

  const tabs = {
    account: { label: '👤 Account', icon: '👤' },
    general: { label: '⚙️ General', icon: '⚙️' },
    usage: { label: '📊 Usage', icon: '📊' },
    mail: { label: '📧 Mail to Task', icon: '📧' },
    tasks: { label: '⏱️ Scheduled', icon: '⏱️' },
    data: { label: '🔐 Data Controls', icon: '🔐' },
    browser: { label: '🌐 Cloud Browser', icon: '🌐' },
    computer: { label: '💻 My Computer', icon: '💻' },
    personalization: { label: '✨ Personalization', icon: '✨' },
  };

  const usagePercent = Math.min((usage.tokensUsed / usage.dailyLimit) * 100, 100);

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <div
        className="w-64 flex flex-col"
        style={{
          backgroundColor: theme.panel,
          borderRight: `1px solid ${theme.border}`,
        }}
      >
        <div className="p-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <h3 className="font-semibold" style={{ color: theme.text }}>Settings</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {Object.entries(tabs).map(([key, tab]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                activeTab === key ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: activeTab === key ? theme.panelHover : 'transparent',
                color: activeTab === key ? theme.text : theme.textMuted,
              }}
            >
              <span>{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <Card title="Profile Information">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: theme.textMuted }}>Name</label>
                    <input
                      type="text"
                      value={account.name}
                      onChange={(e) => updateAccount({ name: e.target.value })}
                      className="w-full rounded-lg px-4 py-2 text-sm"
                      style={{
                        backgroundColor: theme.input,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: theme.textMuted }}>Email</label>
                    <input
                      type="email"
                      value={account.email}
                      onChange={(e) => updateAccount({ email: e.target.value })}
                      className="w-full rounded-lg px-4 py-2 text-sm"
                      style={{
                        backgroundColor: theme.input,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1" style={{ color: theme.textMuted }}>Workspace</label>
                    <input
                      type="text"
                      value={account.workspace}
                      disabled
                      className="w-full rounded-lg px-4 py-2 text-sm"
                      style={{
                        backgroundColor: theme.panel,
                        color: theme.textMuted,
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                  </div>
                </div>
              </Card>

              <Card title="Plan & Billing">
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: theme.panel }}>
                  <div>
                    <div className="font-medium" style={{ color: theme.text }}>Current Plan</div>
                    <div className="text-sm" style={{ color: theme.textMuted }}>{account.plan}</div>
                  </div>
                  <Button variant="primary" size="sm">Upgrade</Button>
                </div>
              </Card>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card title="Preferences">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Language</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Interface language</div>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSettings({ language: e.target.value })}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Date Format</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>How dates are displayed</div>
                    </div>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => updateSettings({ dateFormat: e.target.value })}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Notifications</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Show desktop notifications</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => updateSettings({ notifications: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Sound Effects</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Play sounds for actions</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.sounds}
                      onChange={(e) => updateSettings({ sounds: e.target.checked })}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <Card title="Token Usage">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: theme.text }}>Daily Usage</span>
                      <span className="text-sm" style={{ color: theme.textMuted }}>
                        {usage.tokensUsed.toLocaleString()} / {usage.dailyLimit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.panel }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: usagePercent > 90 ? theme.error : usagePercent > 70 ? theme.warning : theme.success,
                          width: `${usagePercent}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: theme.panel }}>
                      <div className="text-2xl font-bold" style={{ color: theme.accent }}>{usage.apiCalls}</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>API Calls</div>
                    </div>
                    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: theme.panel }}>
                      <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                        {Object.keys(usage.connectorCalls).length}
                      </div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Connectors Used</div>
                    </div>
                    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: theme.panel }}>
                      <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                        {usage.monthlyLimit - usage.tokensUsed}
                      </div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Remaining</div>
                    </div>
                  </div>

                  <Button variant="secondary" onClick={resetUsage}>Reset Statistics</Button>
                </div>
              </Card>
            </div>
          )}

          {/* Mail to Task Tab */}
          {activeTab === 'mail' && (
            <div className="space-y-6">
              <Card title="Email-to-Task Configuration">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Enable Mail-to-Task</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Create tasks by sending emails</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mailToTask.enabled}
                      onChange={(e) => updateMailToTask({ enabled: e.target.checked })}
                    />
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: theme.accent + '10', border: `1px solid ${theme.accent}40` }}>
                    <div className="text-sm font-medium mb-1" style={{ color: theme.accent }}>Your Task Email Address</div>
                    <div className="text-lg font-mono" style={{ color: theme.text }}>{mailToTask.emailAddress}</div>
                    <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
                      Send emails to this address to create tasks automatically
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Auto-Process Emails</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Automatically create tasks from approved senders</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mailToTask.autoProcess}
                      onChange={(e) => updateMailToTask({ autoProcess: e.target.checked })}
                    />
                  </div>
                </div>
              </Card>

              <Card title="Approved Senders">
                <div className="space-y-3">
                  {mailToTask.approvedSenders.map((sender, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: theme.panel }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={sender.enabled}
                          onChange={() => toggleApprovedSender(sender.email)}
                        />
                        <div>
                          <div className="text-sm font-medium" style={{ color: theme.text }}>{sender.name}</div>
                          <div className="text-xs" style={{ color: theme.textMuted }}>{sender.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeApprovedSender(sender.email)}
                        className="text-sm px-2 py-1 rounded"
                        style={{ color: theme.error }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newSenderName}
                      onChange={(e) => setNewSenderName(e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2 text-sm"
                      style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newSenderEmail}
                      onChange={(e) => setNewSenderEmail(e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2 text-sm"
                      style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (newSenderEmail && newSenderName) {
                          addApprovedSender({ email: newSenderEmail, name: newSenderName });
                          setNewSenderEmail('');
                          setNewSenderName('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Scheduled Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <Card title="Automated Tasks (Cron Jobs)">
                <div className="space-y-3">
                  {scheduledTasks.length === 0 ? (
                    <div className="p-4 text-center text-sm" style={{ color: theme.textMuted }}>
                      No scheduled tasks yet. Create recurring automations.
                    </div>
                  ) : (
                    scheduledTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: theme.panel }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.enabled}
                            onChange={() => toggleScheduledTask(task.id)}
                          />
                          <div>
                            <div className="text-sm font-medium" style={{ color: theme.text }}>{task.name}</div>
                            <div className="text-xs" style={{ color: theme.textMuted }}>
                              {task.schedule} • {task.action}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeScheduledTask(task.id)}
                          className="text-sm px-2 py-1 rounded"
                          style={{ color: theme.error }}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      const name = prompt('Task name:');
                      const schedule = prompt('Schedule (e.g., "0 9 * * *" for 9 AM daily):');
                      const action = prompt('Action:');
                      if (name && schedule && action) {
                        addScheduledTask({ name, schedule, action, enabled: true });
                      }
                    }}
                  >
                    + Add Scheduled Task
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Data Controls Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <Card title="Privacy & Data Management">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Store Chat History</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Save conversations for context</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dataControls.storeHistory}
                      onChange={(e) => updateDataControls({ storeHistory: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Index Files</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Index uploaded files for search</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dataControls.indexFiles}
                      onChange={(e) => updateDataControls({ indexFiles: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Allow Training Data</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Contribute anonymized data for improvements</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dataControls.allowTraining}
                      onChange={(e) => updateDataControls({ allowTraining: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Auto-Delete After</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Days to keep data</div>
                    </div>
                    <select
                      value={dataControls.autoDeleteDays}
                      onChange={(e) => updateDataControls({ autoDeleteDays: parseInt(e.target.value) })}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Encryption</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Encrypt stored data</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dataControls.encryptionEnabled}
                      onChange={(e) => updateDataControls({ encryptionEnabled: e.target.checked })}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Cloud Browser Tab */}
          {activeTab === 'browser' && (
            <div className="space-y-6">
              <Card title="Cloud Browser Settings">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Enable Cloud Browser</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Allow AI to browse the web</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cloudBrowser.enabled}
                      onChange={(e) => updateCloudBrowser({ enabled: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Safe Mode</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Filter unsafe content</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cloudBrowser.safeMode}
                      onChange={(e) => updateCloudBrowser({ safeMode: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Allow Downloads</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Download files during browsing</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cloudBrowser.allowDownloads}
                      onChange={(e) => updateCloudBrowser({ allowDownloads: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Default Search Engine</div>
                    </div>
                    <select
                      value={cloudBrowser.defaultSearch}
                      onChange={(e) => updateCloudBrowser({ defaultSearch: e.target.value })}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                    >
                      <option value="google">Google</option>
                      <option value="bing">Bing</option>
                      <option value="duckduckgo">DuckDuckGo</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card title="Browsing History">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cloudBrowser.history.length === 0 ? (
                    <div className="p-3 text-center text-sm" style={{ color: theme.textMuted }}>
                      No browsing history yet
                    </div>
                  ) : (
                    cloudBrowser.history.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded text-sm"
                        style={{ backgroundColor: theme.panel }}
                      >
                        <span style={{ color: theme.text }}>{entry.url}</span>
                        <span style={{ color: theme.textMuted }}>{new Date(entry.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* My Computer Tab */}
          {activeTab === 'computer' && (
            <div className="space-y-6">
              <Card title="Local System Integration">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Enable My Computer</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Allow AI to access local files</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={myComputer.enabled}
                      onChange={(e) => updateMyComputer({ enabled: e.target.checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: theme.panel }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: theme.text }}>Auto-Scan Directories</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>Scan allowed paths on startup</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={myComputer.autoScan}
                      onChange={(e) => updateMyComputer({ autoScan: e.target.checked })}
                    />
                  </div>
                </div>
              </Card>

              <Card title="Allowed Paths">
                <div className="space-y-2">
                  {myComputer.allowedPaths.map((path, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded text-sm"
                      style={{ backgroundColor: theme.panel }}
                    >
                      <span style={{ color: theme.text }}>{path}</span>
                      <button
                        onClick={() => removeAllowedPath(path)}
                        className="text-xs px-2 py-1 rounded"
                        style={{ color: theme.error }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="C:\Users\You\Documents"
                      value={newPath}
                      onChange={(e) => setNewPath(e.target.value)}
                      className="flex-1 rounded-lg px-3 py-2 text-sm"
                      style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (newPath) {
                          addAllowedPath(newPath);
                          setNewPath('');
                        }
                      }}
                    >
                      Add Path
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Blocked Paths (System Protected)">
                <div className="space-y-1">
                  {myComputer.blockedPaths.map((path, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded text-sm"
                      style={{ backgroundColor: theme.error + '10', color: theme.error }}
                    >
                      🚫 {path}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Personalization Tab */}
          {activeTab === 'personalization' && (
            <div className="space-y-6">
              <Card title="Assistant Identity">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1" style={{ color: theme.textMuted }}>Assistant Name</label>
                    <input
                      type="text"
                      value={personalization.assistantName}
                      onChange={(e) => setAssistantName(e.target.value)}
                      className="w-full rounded-lg px-4 py-2 text-sm"
                      style={{
                        backgroundColor: theme.input,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1" style={{ color: theme.textMuted }}>Personality</label>
                    <select
                      value={personalization.assistantPersonality}
                      onChange={(e) => setAssistantPersonality(e.target.value)}
                      className="w-full rounded-lg px-4 py-2 text-sm"
                      style={{ backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="concise">Concise</option>
                      <option value="creative">Creative</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1" style={{ color: theme.textMuted }}>Custom System Prompt</label>
                    <textarea
                      value={personalization.customPrompt}
                      onChange={(e) => updatePersonalization({ customPrompt: e.target.value })}
                      placeholder="Add custom instructions for your AI assistant..."
                      rows={4}
                      className="w-full rounded-lg px-4 py-2 text-sm resize-none"
                      style={{
                        backgroundColor: theme.input,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================

const Workspace = () => {
  const { activeModule } = useAionStore();

  const views = {
    chat: <ChatView />,
    agents: <AgentsView />,
    projects: <ProjectsView />,
    library: <LibraryView />,
    jan: <JanAIView />,
    skills: <SkillsView />,
    connectors: <ConnectorsView />,
    ukservices: <UKServicesView />,
    settings: <SettingsView />,
    history: <HistoryView />,
  };

  return views[activeModule] || views.chat;
};

const App = () => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <div className="h-screen w-screen flex flex-col overflow-hidden">
          <TopBar />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-hidden">
              <Workspace />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </StoreProvider>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Export components for debugging
window.AionComponents = {
  StoreProvider,
  useAionStore,
  ThemeProvider,
  Sidebar,
  ChatView,
  ChatConnectorsButton,
  AgentsView,
  ProjectsView,
  LibraryView,
  JanAIView,
  SkillsView,
  ConnectorsView,
  UKServicesView,
  SettingsView,
  HistoryView,
  TopBar,
  Workspace,
  App,
  themes,
};
