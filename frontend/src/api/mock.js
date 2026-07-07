// Shared JS mock data layer for the frontend dev mode without backend

function catScore(
  category,
  ws,
  rs,
  pop,
  total,
  vd,
  llm,
  sr,
  date = '2026-06-15T03:00:00Z'
) {
  return {
    category, raw_score: rs, weighted_score: ws,
    populated_metrics: pop, total_metrics: total,
    confidence_breakdown: { verified_doc: vd, llm_inferred: llm, self_reported: sr },
    computed_at: date,
  };
}

const MOCK_STARTUPS = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    name: 'NeuralBridge AI',
    stage: 'Series A',
    sector: 'Enterprise SaaS',
    website: 'https://neuralbridge.ai',
    profile_completeness_pct: 87,
    created_at: '2025-09-01T00:00:00Z',
    last_scored_at: '2026-06-28T03:00:00Z',
    total_weighted_score: 8.42,
    category_scores: {
      tech:   catScore('tech',   9.1, 9.0, 18, 20, 0.70, 0.20, 0.10, '2026-06-28T03:00:00Z'),
      certs:  catScore('certs',  8.3, 8.2, 12, 15, 0.90, 0.05, 0.05, '2026-06-28T03:00:00Z'),
      market: catScore('market', 8.8, 8.7, 19, 20, 0.60, 0.25, 0.15, '2026-06-28T03:00:00Z'),
      future: catScore('future', 7.9, 7.8, 13, 15, 0.40, 0.40, 0.20, '2026-06-28T03:00:00Z'),
      team:   catScore('team',   8.5, 8.4, 14, 15, 0.50, 0.30, 0.20, '2026-06-28T03:00:00Z'),
      risk:   catScore('risk',   7.6, 7.5, 13, 15, 0.55, 0.25, 0.20, '2026-06-28T03:00:00Z'),
    },
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    name: 'QuantumLeap Health',
    stage: 'Seed',
    sector: 'HealthTech',
    website: 'https://quantumleap.health',
    profile_completeness_pct: 71,
    created_at: '2025-11-15T00:00:00Z',
    last_scored_at: '2026-06-20T03:00:00Z',
    total_weighted_score: 7.18,
    category_scores: {
      tech:   catScore('tech',   8.2, 8.0, 15, 20, 0.55, 0.30, 0.15, '2026-06-20T03:00:00Z'),
      certs:  catScore('certs',  9.1, 9.0,  9, 15, 0.95, 0.03, 0.02, '2026-06-20T03:00:00Z'),
      market: catScore('market', 6.4, 6.2, 14, 20, 0.30, 0.45, 0.25, '2026-06-20T03:00:00Z'),
      future: catScore('future', 7.5, 7.3, 11, 15, 0.35, 0.45, 0.20, '2026-06-20T03:00:00Z'),
      team:   catScore('team',   7.8, 7.6, 12, 15, 0.45, 0.35, 0.20, '2026-06-20T03:00:00Z'),
      risk:   catScore('risk',   5.9, 5.7, 10, 15, 0.40, 0.30, 0.30, '2026-06-20T03:00:00Z'),
    },
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    name: 'CarbonZero Logistics',
    stage: 'Pre-Seed',
    sector: 'CleanTech',
    website: null,
    profile_completeness_pct: 52,
    created_at: '2026-01-10T00:00:00Z',
    last_scored_at: '2026-03-01T03:00:00Z',
    total_weighted_score: 5.76,
    category_scores: {
      tech:   catScore('tech',   6.1, 6.0, 10, 20, 0.20, 0.40, 0.40, '2026-03-01T03:00:00Z'),
      certs:  catScore('certs',  4.5, 4.3,  5, 15, 0.60, 0.10, 0.30, '2026-03-01T03:00:00Z'),
      market: catScore('market', 6.8, 6.5, 11, 20, 0.15, 0.50, 0.35, '2026-03-01T03:00:00Z'),
      future: catScore('future', 5.9, 5.7,  8, 15, 0.10, 0.55, 0.35, '2026-03-01T03:00:00Z'),
      team:   catScore('team',   5.2, 5.0,  7, 15, 0.20, 0.40, 0.40, '2026-03-01T03:00:00Z'),
      risk:   catScore('risk',   5.5, 5.3,  6, 15, 0.30, 0.30, 0.40, '2026-03-01T03:00:00Z'),
    },
  },
  {
    id: '11111111-0000-0000-0000-000000000004',
    name: 'Meridian Fintech',
    stage: 'Series B',
    sector: 'FinTech',
    website: 'https://meridianfin.io',
    profile_completeness_pct: 95,
    created_at: '2024-06-01T00:00:00Z',
    last_scored_at: '2026-07-01T03:00:00Z',
    total_weighted_score: 9.05,
    category_scores: {
      tech:   catScore('tech',   9.4, 9.3, 20, 20, 0.80, 0.15, 0.05, '2026-07-01T03:00:00Z'),
      certs:  catScore('certs',  9.8, 9.7, 15, 15, 0.98, 0.01, 0.01, '2026-07-01T03:00:00Z'),
      market: catScore('market', 9.2, 9.1, 20, 20, 0.75, 0.18, 0.07, '2026-07-01T03:00:00Z'),
      future: catScore('future', 8.7, 8.6, 15, 15, 0.65, 0.25, 0.10, '2026-07-01T03:00:00Z'),
      team:   catScore('team',   9.0, 8.9, 15, 15, 0.70, 0.20, 0.10, '2026-07-01T03:00:00Z'),
      risk:   catScore('risk',   8.9, 8.8, 15, 15, 0.75, 0.15, 0.10, '2026-07-01T03:00:00Z'),
    },
  },
  {
    id: '11111111-0000-0000-0000-000000000005',
    name: 'Orbital Robotics',
    stage: 'Seed',
    sector: 'DeepTech',
    website: 'https://orbitalrobotics.com',
    profile_completeness_pct: 63,
    created_at: '2025-08-20T00:00:00Z',
    last_scored_at: '2026-05-10T03:00:00Z',
    total_weighted_score: 6.51,
    category_scores: {
      tech:   catScore('tech',   8.9, 8.7, 16, 20, 0.65, 0.25, 0.10, '2026-05-10T03:00:00Z'),
      certs:  catScore('certs',  5.0, 4.8,  6, 15, 0.70, 0.10, 0.20, '2026-05-10T03:00:00Z'),
      market: catScore('market', 5.8, 5.6, 10, 20, 0.20, 0.50, 0.30, '2026-05-10T03:00:00Z'),
      future: catScore('future', 7.8, 7.6, 12, 15, 0.45, 0.40, 0.15, '2026-05-10T03:00:00Z'),
      team:   catScore('team',   7.0, 6.8, 10, 15, 0.35, 0.40, 0.25, '2026-05-10T03:00:00Z'),
      risk:   catScore('risk',   4.8, 4.6,  8, 15, 0.30, 0.35, 0.35, '2026-05-10T03:00:00Z'),
    },
  },
  {
    id: '11111111-0000-0000-0000-000000000006',
    name: 'GreenGrid Energy',
    stage: 'Pre-Seed',
    sector: 'CleanTech',
    website: null,
    profile_completeness_pct: 38,
    created_at: '2026-03-01T00:00:00Z',
    last_scored_at: '2025-12-01T03:00:00Z',
    total_weighted_score: 3.82,
    category_scores: {
      tech:   catScore('tech',   4.2, 4.0,  7, 20, 0.10, 0.40, 0.50, '2025-12-01T03:00:00Z'),
      certs:  catScore('certs',  2.5, 2.3,  3, 15, 0.30, 0.10, 0.60, '2025-12-01T03:00:00Z'),
      market: catScore('market', 4.5, 4.2,  7, 20, 0.10, 0.45, 0.45, '2025-12-01T03:00:00Z'),
      future: catScore('future', 3.8, 3.6,  5, 15, 0.05, 0.50, 0.45, '2025-12-01T03:00:00Z'),
      team:   catScore('team',   4.0, 3.8,  5, 15, 0.15, 0.40, 0.45, '2025-12-01T03:00:00Z'),
      risk:   catScore('risk',   3.5, 3.3,  5, 15, 0.20, 0.35, 0.45, '2025-12-01T03:00:00Z'),
    },
  },
];

function generateHistory(startupId, baseScores) {
  const history = [];
  const categories = Object.keys(baseScores);
  const months = 6;

  for (let m = months; m >= 0; m--) {
    const date = new Date();
    date.setMonth(date.getMonth() - m);
    date.setDate(1);

    for (const cat of categories) {
      const jitter = (Math.sin(m * 7.3 + categories.indexOf(cat) * 2.1) * 0.8);
      const score = Math.max(0, Math.min(10, baseScores[cat] - (m * 0.15) + jitter));
      history.push({
        category: cat,
        weighted_score: Math.round(score * 10) / 10,
        computed_at: date.toISOString(),
        triggered_by: m === 0 ? 'manual' : 'workflow_d_cron',
      });
    }
  }
  return history;
}

const MOCK_DETAILS = {};
for (const s of MOCK_STARTUPS) {
  const baseScores = {};
  for (const [cat, cs] of Object.entries(s.category_scores)) {
    baseScores[cat] = cs.weighted_score;
  }
  MOCK_DETAILS[s.id] = {
    startup: {
      id: s.id, name: s.name, stage: s.stage,
      sector: s.sector, website: s.website,
      profile_completeness_pct: s.profile_completeness_pct,
      created_at: s.created_at,
    },
    scores: Object.values(s.category_scores),
    score_history: generateHistory(s.id, baseScores),
  };
}

export const mockApi = {
  getLeaderboard: async () => {
    await delay(400);
    return { data: { startups: [...MOCK_STARTUPS].sort((a, b) => b.total_weighted_score - a.total_weighted_score) } };
  },
  getStartupDetail: async (id) => {
    await delay(300);
    const detail = MOCK_DETAILS[id];
    if (!detail) throw new Error('Not found');
    return { data: detail };
  },
  login: async (email, password) => {
    await delay(600);
    if (!email.includes('@') || password.length < 4) {
      throw { response: { data: { error: 'Invalid credentials' } } };
    }
    
    let role = 'investor';
    if (email === 'admin@zoora.ai') {
      role = 'admin';
    } else {
      const mockFounder = MOCK_USERS.find(u => u.email === email);
      if (mockFounder) role = mockFounder.role;
    }
    const mockFounder = MOCK_USERS.find(u => u.email === email);
    const startupId = mockFounder ? mockFounder.startupId : null;

    return {
      data: {
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vIiwicm9sZSI6IiR7cm9sZX0iLCJlbWFpbCI6IiR7ZW1haWx9IiwiZXhwIjo5OTk5OTk5OTk5fQ.mock`,
        user: { userId: 'demo', role, email, startupId },
      },
    };
  },
  register: async (data) => {
    await delay(800);
    if (data.role === 'founder') {
      const newStartupId = `mock-startup-${Date.now()}`;
      const newStartup = {
        id: newStartupId,
        name: data.startupName,
        stage: data.startupStage,
        sector: data.startupSector,
        website: null,
        profile_completeness_pct: 0,
        created_at: new Date().toISOString(),
        last_scored_at: null,
        total_weighted_score: 0,
        category_scores: {}
      };
      MOCK_STARTUPS.push(newStartup);
      MOCK_DETAILS[newStartupId] = {
        startup: newStartup,
        scores: [],
        score_history: []
      };
      MOCK_USERS.push({ email: data.email, role: 'founder', startupId: newStartupId });

      return {
        data: {
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZW1vIiwicm9sZSI6ImZvdW5kZXIiLCJlbWFpbCI6IiR7ZGF0YS5lbWFpbH0iLCJleHAiOjk5OTk5OTk5OTl9.mock`,
          user: { userId: 'demo', role: 'founder', email: data.email, startupId: newStartupId },
        },
      };
    }
    throw new Error("Only founder registration is mocked.");
  },
  getUploadUrl: async (startupId, docType, filename, contentType) => {
    await delay(400);
    const docId = `doc-${Date.now()}`;
    const objectKey = `${startupId}/${docType}/${Date.now()}_${filename}`;
    
    // Add to mock documents list
    MOCK_DOCUMENTS.push({
      id: docId,
      startup_id: startupId,
      file_url: objectKey,
      doc_type: docType,
      uploaded_at: new Date().toISOString(),
      parse_status: 'pending',
      filename: filename,
      verification_status: 'pending'
    });

    return {
      data: {
        upload_url: `https://mock-minio.local/upload?id=${Date.now()}`,
        object_key: objectKey,
        document: {
          id: docId,
          parse_status: 'pending'
        }
      }
    };
  },
  uploadDocumentDirect: async (url, file, contentType) => {
    await delay(1500); // Simulate upload time
    
    // Find the pending document and simulate it being parsed successfully after upload
    const pendingDoc = MOCK_DOCUMENTS.find(d => d.parse_status === 'pending');
    if (pendingDoc) {
      setTimeout(() => {
        pendingDoc.parse_status = 'parsed';
      }, 5000); // changes status to parsed in 5 seconds
    }
    
    return { status: 200 };
  },
  getDocuments: async (startupId) => {
    await delay(300);
    return { data: { documents: MOCK_DOCUMENTS.filter(d => d.startup_id === startupId) } };
  },
  deleteDocument: async (docId) => {
    await delay(300);
    const idx = MOCK_DOCUMENTS.findIndex(d => d.id === docId);
    if (idx !== -1) {
      MOCK_DOCUMENTS.splice(idx, 1);
    }
    return { data: { success: true } };
  },
  getAdminDocuments: async () => {
    await delay(400);
    // map startup names
    const docs = MOCK_DOCUMENTS.map(d => {
      const startup = MOCK_STARTUPS.find(s => s.id === d.startup_id);
      return {
        ...d,
        startup_name: startup ? startup.name : 'Unknown Startup',
        uploaded_by_email: 'founder@' + (startup ? startup.name.toLowerCase().replace(/\s+/g, '') : 'startup') + '.com',
        parsed_text: d.doc_type === 'pitch_deck' ? "This is a parsed pitch deck content. It contains information about market growth, technical architecture, and core team." : "Verified certificate text."
      };
    });
    return { data: { documents: docs } };
  },
  verifyDocument: async (docId, action) => {
    await delay(300);
    const doc = MOCK_DOCUMENTS.find(d => d.id === docId);
    if (doc) {
      doc.verification_status = action === 'verify' ? 'verified' : 'rejected';
    }
    return { data: { id: docId, verification_status: doc ? doc.verification_status : 'pending' } };
  }
};

const MOCK_USERS = [];

// Seed some initial documents for demo startups
const MOCK_DOCUMENTS = [
  {
    id: 'doc-1',
    startup_id: '11111111-0000-0000-0000-000000000001', // NeuralBridge
    file_url: '11111111-0000-0000-0000-000000000001/pitch_deck/neuralbridge_pitch.pdf',
    doc_type: 'pitch_deck',
    uploaded_at: '2026-06-10T10:00:00Z',
    parse_status: 'parsed',
    filename: 'neuralbridge_pitch.pdf',
    verification_status: 'pending'
  },
  {
    id: 'doc-2',
    startup_id: '11111111-0000-0000-0000-000000000001',
    file_url: '11111111-0000-0000-0000-000000000001/financial_audit/audit_2025.pdf',
    doc_type: 'financial_audit',
    uploaded_at: '2026-06-15T14:30:00Z',
    parse_status: 'parsed',
    filename: 'audit_2025.pdf',
    verification_status: 'pending'
  },
  {
    id: 'doc-3',
    startup_id: '11111111-0000-0000-0000-000000000001',
    file_url: '11111111-0000-0000-0000-000000000001/loi/loi_google.pdf',
    doc_type: 'loi',
    uploaded_at: '2026-06-28T09:15:00Z',
    parse_status: 'pending',
    filename: 'loi_google.pdf',
    verification_status: 'pending'
  }
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
