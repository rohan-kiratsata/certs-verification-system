export type CertificateStatus = "active" | "revoked";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
};

export type Program = {
  id: number;
  name: string;
  type: string;
};

export type Certificate = {
  id: number;
  certificate_id: string;
  recipient: {
    name: string;
    email: string;
  };
  status: CertificateStatus;
  issued_at: string;
  expires_at: string | null;
  pdf_path: string | null;
  revoked_at: string | null;
  revocation_reason: string | null;
  revoked_by?: AdminUser | null;
  user: AdminUser;
  program: Program;
  created_at: string;
};

export type PaginationMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type CertificateListResponse = {
  data: Certificate[];
  meta: PaginationMeta;
};

export type DataResponse<T> = {
  data: T;
  message?: string;
};
