export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_suggestions: {
        Row: {
          ai_content: string | null
          ai_headlines: Json | null
          ai_summary: string | null
          ai_title: string | null
          category: string | null
          confidence: number | null
          created_at: string | null
          id: string
          image_url: string | null
          original_summary: string | null
          original_title: string
          source_name: string | null
          source_url: string | null
          status: string | null
          tags: Json | null
        }
        Insert: {
          ai_content?: string | null
          ai_headlines?: Json | null
          ai_summary?: string | null
          ai_title?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          original_summary?: string | null
          original_title: string
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          tags?: Json | null
        }
        Update: {
          ai_content?: string | null
          ai_headlines?: Json | null
          ai_summary?: string | null
          ai_title?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          original_summary?: string | null
          original_title?: string
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          tags?: Json | null
        }
        Relationships: []
      }
      article_comments: {
        Row: {
          article_id: string
          author_name: string
          content: string
          created_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          article_id: string
          author_name: string
          content: string
          created_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          article_id?: string
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_media: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          media_type: string
          media_url: string
          position: number | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          media_type?: string
          media_url: string
          position?: number | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          media_type?: string
          media_url?: string
          position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "article_media_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          session_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          session_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          category: string
          content: string | null
          created_at: string | null
          hero_duration_hours: number | null
          hero_enabled: boolean | null
          hero_expires_at: string | null
          id: string
          image_url: string | null
          importance_score: number | null
          is_breaking: boolean | null
          is_featured: boolean | null
          is_important: boolean | null
          is_opinion: boolean | null
          is_trending: boolean | null
          published_at: string | null
          read_time: string | null
          seo_description: string | null
          seo_title: string | null
          show_in_hero: boolean | null
          source_name: string | null
          source_url: string | null
          status: string | null
          subcategory: string | null
          subheadline: string | null
          summary: string | null
          tags: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          hero_duration_hours?: number | null
          hero_enabled?: boolean | null
          hero_expires_at?: string | null
          id?: string
          image_url?: string | null
          importance_score?: number | null
          is_breaking?: boolean | null
          is_featured?: boolean | null
          is_important?: boolean | null
          is_opinion?: boolean | null
          is_trending?: boolean | null
          published_at?: string | null
          read_time?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_hero?: boolean | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          subcategory?: string | null
          subheadline?: string | null
          summary?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          hero_duration_hours?: number | null
          hero_enabled?: boolean | null
          hero_expires_at?: string | null
          id?: string
          image_url?: string | null
          importance_score?: number | null
          is_breaking?: boolean | null
          is_featured?: boolean | null
          is_important?: boolean | null
          is_opinion?: boolean | null
          is_trending?: boolean | null
          published_at?: string | null
          read_time?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_hero?: boolean | null
          source_name?: string | null
          source_url?: string | null
          status?: string | null
          subcategory?: string | null
          subheadline?: string | null
          summary?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
