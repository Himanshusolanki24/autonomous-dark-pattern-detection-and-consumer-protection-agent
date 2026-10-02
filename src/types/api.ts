// =============================================================================
// types/api.ts
// Stable API contract shared between backend and the Next.js frontend.
// =============================================================================

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export interface ApiEvent {
  id: number;
  sessionId: string;
  agent: string | null;
  eventType: string;
  message: string | null;
  status: string | null;
  createdAt: string;
}

export interface ApiApproval {
  required: boolean;
  approvalId?: string;
  actionType?: string;
  riskLevel?: string;
  description?: string;
  expiresAt?: string;
}

export interface ApiVerification {
  success: boolean;
  evidence?: string;
  verifiedAt?: string;
}

export interface StartAgentRequest {
  goal: string;
  targetUrl: string;
}

export interface StartAgentResponse {
  sessionId: string;
  taskId: string;
  status: string;
}

export interface ScannerRequest {
  url: string;
}

export interface ScannerDetection {
  patternType: string;
  severity: string;
  confidence: number;
  explanation: string;
  elementText?: string;
  elementRole?: string;
}

export interface ScannerResponse {
  overallRisk: string;
  patternsDetected: number;
  detections: ScannerDetection[];
}

export interface ProfileResponse {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
}

export interface ActivityItem {
  id: number;
  timestamp: string;
  agent: string | null;
  eventType: string;
  message: string | null;
  status: string | null;
  website: string | null;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}