import fs from 'fs';
import path from 'path';

export interface MpladsOverview {
  totalAllocated?: number;
  totalExpenditure?: number;
  utilizationPercentage?: number;
  totalWorksRecommended?: number;
  totalWorksCompleted?: number;
  completionRate?: number;
  totalMPs?: number;
  avgAllocation?: number;
  inProgressPayments?: number;
  completedWorksValue?: number;
  paymentGap?: number;
  pendingWorks?: number;
}

export interface StateSummary {
  state: string;
  totalAllocated?: number;
  totalExpenditure?: number;
  utilizationPercentage?: number;
  totalWorksCompleted?: number;
  completedWorksCount?: number;
  recommendedWorksCount?: number;
}

export interface MpSummary {
  id?: string;
  mpName?: string;
  name?: string;
  house?: string;
  constituency?: string;
  state: string;
  allocatedAmount?: number;
  allocated?: number;
  totalExpenditure?: number;
  expenditure?: number;
  unspentAmount?: number;
  utilizationPercentage?: number;
  completedWorksCount?: number;
  worksCompleted?: number;
}

export interface SectorSummaryItem {
  name: string;
  works?: {
    count?: number;
    totalCost?: number;
    avgCost?: number;
  };
}

export interface CompletedWorkItem {
  _id?: string;
  work_id?: number;
  work_description?: string;
  category?: string;
  cost?: number;
  location?: string;
  district?: string;
  state?: string;
  mp_details?: {
    name: string;
    constituency: string;
    party?: string;
  };
}

function resolveJsonDir(): string | null {
  const possiblePaths = [
    path.join(process.cwd(), 'frontend', 'public', 'data', 'mplads', 'json'),
    path.join(process.cwd(), 'public', 'data', 'mplads', 'json'),
    path.join(process.cwd(), 'data', 'mplads', 'json'),
    path.join(__dirname, '..', '..', 'public', 'data', 'mplads', 'json'),
    path.join(__dirname, '..', '..', '..', 'data', 'mplads', 'json'),
    path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'data', 'mplads', 'json'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

export function getMpladsData() {
  const jsonDir = resolveJsonDir();
  
  let overview: MpladsOverview | null = null;
  let states: StateSummary[] = [];
  let mps: MpSummary[] = [];
  let sectors: SectorSummaryItem[] = [];
  let completedWorks: CompletedWorkItem[] = [];

  if (!jsonDir) {
    return { overview, states, mps, sectors, completedWorks };
  }

  try {
    const ovPath = path.join(jsonDir, 'summary_overview.json');
    if (fs.existsSync(ovPath)) {
      const raw = JSON.parse(fs.readFileSync(ovPath, 'utf8'));
      overview = raw.data || raw;
    }

    const stPath = path.join(jsonDir, 'summary_states.json');
    if (fs.existsSync(stPath)) {
      const raw = JSON.parse(fs.readFileSync(stPath, 'utf8'));
      states = Array.isArray(raw) ? raw : (raw.data || []);
    }

    const mpPath = path.join(jsonDir, 'summary_mps.json');
    if (fs.existsSync(mpPath)) {
      const raw = JSON.parse(fs.readFileSync(mpPath, 'utf8'));
      mps = Array.isArray(raw) ? raw : (raw.data || []);
    }

    const secPath = path.join(jsonDir, 'mplads_sectors.json');
    if (fs.existsSync(secPath)) {
      const raw = JSON.parse(fs.readFileSync(secPath, 'utf8'));
      sectors = raw.data?.sectors || (Array.isArray(raw) ? raw : []);
    }

    const workPath = path.join(jsonDir, 'works_completed.json');
    if (fs.existsSync(workPath)) {
      const raw = JSON.parse(fs.readFileSync(workPath, 'utf8'));
      completedWorks = raw.data?.completedWorks || (Array.isArray(raw) ? raw : []);
    }
  } catch (err) {
    console.error('Error reading MPLADS JSON datasets:', err);
  }

  return { overview, states, mps, sectors, completedWorks };
}
