// =============================================================================
// types/database.ts
// Supabase database types. Regenerate from the live schema with:
//   npm run db:types   (wraps `supabase gen types typescript`)
// The schema in supabase/migrations/ is the source of truth.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AgentStatus =
  | "idle"
  | "running"
  | "approval_required"
  | "completed"
  | "failed"
  | "cancelled";

export type AgentStage = "perception" | "detection" | "planning" | "action" | "verification";

export type PatternType =
  | "confirmshaming"
  | "forced_continuity"
  | "roach_motel"
  | "drip_pricing"
  | "basket_sneaking"
  | "false_urgency"
  | "misdirection"
  | "hidden_costs"
  | "nagging"
  | "forced_action"
  | "subscription_trap"
  | "urgency"
  | "disguised_ads";

export type Severity = "low" | "medium" | "high" | "critical";

export type EventType =
  | "session_started"
  | "page_loaded"
  | "page_perceived"
  | "pattern_detected"
  | "plan_created"
  | "action_started"
  | "action_completed"
  | "approval_required"
  | "approval_granted"
  | "approval_rejected"
  | "verification_started"
  | "verification_completed"
  | "session_completed"
  | "session_failed"
  | "stage_started"
  | "stage_completed"
  | "perception_completed"
  | "detection_completed"
  | "goal_reached"
  | "action_failed"
  | "approval_requested"
  | "task_completed"
  | "task_failed"
  | "task_cancelled"
  | "session_stopped";

export type TaskStatus =
  | "pending"
  | "running"
  | "approval_required"
  | "cancelled"
  | "completed"
  | "failed"
  | "blocked";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export type ActionType = "final_cancellation";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_sessions: {
        Row: {
          id: string;
          user_id: string;
          goal: string;
          status: AgentStatus;
          current_stage: AgentStage | null;
          target_url: string;
          state: Json | null;
          started_at: string | null;
          completed_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal: string;
          status?: AgentStatus;
          current_stage?: AgentStage | null;
          target_url: string;
          state?: Json | null;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal?: string;
          status?: AgentStatus;
          current_stage?: AgentStage | null;
          target_url?: string;
          state?: Json | null;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_events: {
        Row: {
          id: number;
          session_id: string;
          user_id: string;
          agent: AgentStage | null;
          event_type: EventType;
          message: string | null;
          status: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: string;
          user_id: string;
          agent?: AgentStage | null;
          event_type: EventType;
          message?: string | null;
          status?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          session_id?: string;
          user_id?: string;
          agent?: AgentStage | null;
          event_type?: EventType;
          message?: string | null;
          status?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      dark_pattern_detections: {
        Row: {
          id: number;
          session_id: string | null;
          user_id: string;
          pattern_type: PatternType;
          severity: Severity;
          confidence: number;
          element_text: string | null;
          element_role: string | null;
          explanation: string | null;
          screenshot_path: string | null;
          source_url: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id?: string | null;
          user_id: string;
          pattern_type: PatternType;
          severity: Severity;
          confidence: number;
          element_text?: string | null;
          element_role?: string | null;
          explanation?: string | null;
          screenshot_path?: string | null;
          source_url?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          session_id?: string | null;
          user_id?: string;
          pattern_type?: PatternType;
          severity?: Severity;
          confidence?: number;
          element_text?: string | null;
          element_role?: string | null;
          explanation?: string | null;
          screenshot_path?: string | null;
          source_url?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      cancellation_tasks: {
        Row: {
          id: string;
          user_id: string;
          agent_session_id: string | null;
          service_name: string;
          target_url: string;
          status: TaskStatus;
          requested_at: string;
          started_at: string | null;
          approval_requested_at: string | null;
          approved_at: string | null;
          completed_at: string | null;
          failure_reason: string | null;
          proof_screenshot_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agent_session_id?: string | null;
          service_name: string;
          target_url: string;
          status?: TaskStatus;
          requested_at?: string;
          started_at?: string | null;
          approval_requested_at?: string | null;
          approved_at?: string | null;
          completed_at?: string | null;
          failure_reason?: string | null;
          proof_screenshot_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agent_session_id?: string | null;
          service_name?: string;
          target_url?: string;
          status?: TaskStatus;
          requested_at?: string;
          started_at?: string | null;
          approval_requested_at?: string | null;
          approved_at?: string | null;
          completed_at?: string | null;
          failure_reason?: string | null;
          proof_screenshot_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_approvals: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          task_id: string | null;
          action_type: ActionType;
          description: string | null;
          risk_level: Severity;
          status: ApprovalStatus;
          requested_at: string;
          responded_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          task_id?: string | null;
          action_type?: ActionType;
          description?: string | null;
          risk_level?: Severity;
          status?: ApprovalStatus;
          requested_at?: string;
          responded_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          task_id?: string | null;
          action_type?: ActionType;
          description?: string | null;
          risk_level?: Severity;
          status?: ApprovalStatus;
          requested_at?: string;
          responded_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: number;
          user_id: string | null;
          session_id: string | null;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          session_id?: string | null;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          session_id?: string | null;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      idempotency_keys: {
        Row: {
          key: string;
          user_id: string;
          response: Json | null;
          created_at: string;
        };
        Insert: {
          key: string;
          user_id: string;
          response?: Json | null;
          created_at?: string;
        };
        Update: {
          key?: string;
          user_id?: string;
          response?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      expire_pending_approvals: {
        Args: Record<string, never>;
        Returns: number;
      };
      delete_expired_proofs: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      agent_status: AgentStatus;
      agent_stage: AgentStage;
      pattern_type: PatternType;
      severity: Severity;
      event_type: EventType;
      task_status: TaskStatus;
      approval_status: ApprovalStatus;
      action_type: ActionType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];