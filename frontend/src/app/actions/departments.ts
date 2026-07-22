'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDepartments() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('departments').select('*').order('name', { ascending: true });

  if (error || !data || data.length === 0) {
    return [
      {
        id: 'dep-1',
        name: 'Ministry of Home Affairs',
        description: 'Internal Security, Police, Border Management, Center-State Relations & Disaster Management.',
        branch: 'Executive',
        is_mock: true
      },
      {
        id: 'dep-2',
        name: 'Ministry of Finance - Department of Economic Affairs',
        description: 'Macroeconomic Policy, Federal Capital Budgeting, External Assistance, Infrastructure Financing.',
        branch: 'Executive',
        is_mock: true
      },
      {
        id: 'dep-3',
        name: 'Ministry of Cooperation',
        description: 'General Policy on Cooperatives, Incorporation and Winding up of Multi-State Cooperative Societies.',
        branch: 'Executive',
        is_mock: true
      },
      {
        id: 'dep-4',
        name: 'Ministry of Environment, Forest and Climate Change',
        description: 'Conservation of Forests, Biodiversity Protection, Climate Mitigation, Environmental Impact Assessment.',
        branch: 'Executive',
        is_mock: true
      }
    ];
  }
  return data;
}

export async function getDepartmentMandatesAndOfficers() {
  const supabase = await createClient();
  const [depsRes, mandatesRes, officersRes] = await Promise.all([
    supabase.from('departments').select('*'),
    supabase.from('department_mandates').select('*'),
    supabase.from('ias_officers').select('*')
  ]);

  let mandates = mandatesRes.data || [];
  let officers = officersRes.data || [];

  if (mandates.length === 0) {
    mandates = [
      {
        id: 'm1',
        department_name: 'Ministry of Home Affairs',
        mandate_summary: 'Internal Security, Police, Border Management, Center-State Relations, Disaster Management.',
        subject_rules: '1. Maintenance of public order. 2. Union territory administration. 3. National Disaster Management Authority.',
        source_doc: 'Allocation of Business Rules 1961 (Amended 2024)',
        is_mock: true
      },
      {
        id: 'm2',
        department_name: 'Ministry of Finance - Department of Economic Affairs',
        mandate_summary: 'Macroeconomic Policy, Federal Capital Budgeting, External Assistance, Infrastructure Financing.',
        subject_rules: '1. Preparation of Union Budget. 2. Management of public debt. 3. Currency and coinage regulations.',
        source_doc: 'Allocation of Business Rules 1961 (Amended 2024)',
        is_mock: true
      },
      {
        id: 'm3',
        department_name: 'Ministry of Cooperation',
        mandate_summary: 'General Policy on Cooperatives, Incorporation and Winding up of Multi-State Cooperative Societies.',
        subject_rules: '1. Strengthening of cooperative movement. 2. Ease of doing business for cooperatives. 3. National cooperative databases.',
        source_doc: 'Allocation of Business Rules (Amended 2021 Notification)',
        is_mock: true
      }
    ];
  }

  if (officers.length === 0) {
    officers = [
      {
        id: 'o1',
        officer_name: 'T. V. Somanathan',
        allotment_year: 1987,
        cadre: 'Tamil Nadu',
        current_posting: 'Cabinet Secretary, Government of India',
        pay_level: 'Level 17 (Cabinet Secretary Scale)',
        qualification: 'Ph.D. Economics, B.Com, ACA, ACMA',
        is_mock: true
      },
      {
        id: 'o2',
        officer_name: 'Ajay Kumar Bhalla',
        allotment_year: 1984,
        cadre: 'Assam-Meghalaya',
        current_posting: 'Home Secretary, Ministry of Home Affairs',
        pay_level: 'Level 17 (Apex Scale)',
        qualification: 'M.Sc. Botany, M.Phil',
        is_mock: true
      },
      {
        id: 'o3',
        officer_name: 'Rajesh Kumar Singh',
        allotment_year: 1989,
        cadre: 'Kerala',
        current_posting: 'Secretary, Department for Promotion of Industry and Internal Trade (DPIIT)',
        pay_level: 'Level 17',
        qualification: 'M.A. Economics',
        is_mock: true
      },
      {
        id: 'o4',
        officer_name: 'Raj Kumar',
        allotment_year: 1987,
        cadre: 'Gujarat',
        current_posting: 'Chief Secretary, Government of Gujarat',
        pay_level: 'Level 17 (Chief Secretary Scale)',
        qualification: 'B.Tech Electrical Engineering, M.Tech',
        is_mock: true
      }
    ];
  }

  return {
    departments: depsRes.data || [],
    mandates,
    officers
  };
}
