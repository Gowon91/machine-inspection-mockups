export type Consultant = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  region: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  name: string;
  biz_number: string | null;
  industry: string | null;
  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  worker_count: number | null;
  contract_type: string | null;
  consultant_id: string | null;
  status: string;
  created_at: string;
};

export type Visit = {
  id: string;
  client_id: string;
  consultant_id: string | null;
  visit_date: string;
  visit_type: string;
  status: string;
  summary: string | null;
  created_at: string;
};

export type Finding = {
  id: string;
  visit_id: string;
  category: string | null;
  description: string;
  risk_level: string;
  corrective_action: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
};
