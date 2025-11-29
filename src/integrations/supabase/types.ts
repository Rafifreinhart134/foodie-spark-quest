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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          awarded_at: string
          badge_type: Database["public"]["Enums"]["badge_type"]
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_type: Database["public"]["Enums"]["badge_type"]
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_type?: Database["public"]["Enums"]["badge_type"]
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      calorie_scans: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_posted: boolean | null
          items: Json
          total_calories: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_posted?: boolean | null
          items: Json
          total_calories: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_posted?: boolean | null
          items?: Json
          total_calories?: number
          user_id?: string
        }
        Relationships: []
      }
      coins: {
        Row: {
          balance: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          is_like: boolean
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_like?: boolean
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_like?: boolean
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          related_user_id: string | null
          related_video_id: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_user_id?: string | null
          related_video_id?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          related_user_id?: string | null
          related_video_id?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_video_id_fkey"
            columns: ["related_video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          photo_url: string | null
          price_range: string | null
          rating: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          photo_url?: string | null
          price_range?: string | null
          rating?: number | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          photo_url?: string | null
          price_range?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      playlist_videos: {
        Row: {
          added_at: string | null
          id: string
          playlist_id: string
          position: number
          video_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          playlist_id: string
          position?: number
          video_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          playlist_id?: string
          position?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_videos_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          follower_count: number | null
          following_count: number | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
          video_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
          video_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
          video_count?: number | null
        }
        Relationships: []
      }
      reposts: {
        Row: {
          created_at: string
          id: string
          original_video_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          original_video_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          original_video_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposts_original_video_id_fkey"
            columns: ["original_video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_videos: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          created_at: string
          duration: number | null
          expires_at: string
          id: string
          is_archived: boolean | null
          is_public: boolean | null
          media_type: string
          media_url: string
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          media_type: string
          media_url: string
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          expires_at?: string
          id?: string
          is_archived?: boolean | null
          is_public?: boolean | null
          media_type?: string
          media_url?: string
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      video_tags: {
        Row: {
          created_at: string
          created_by: string
          id: string
          tagged_user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          tagged_user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          tagged_user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_tags_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          budget: string | null
          category: Database["public"]["Enums"]["content_category"]
          comment_count: number | null
          cooking_time: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          like_count: number | null
          location: string | null
          nutritional_info: Json | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          budget?: string | null
          category: Database["public"]["Enums"]["content_category"]
          comment_count?: number | null
          cooking_time?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          location?: string | null
          nutritional_info?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          budget?: string | null
          category?: Database["public"]["Enums"]["content_category"]
          comment_count?: number | null
          cooking_time?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          location?: string | null
          nutritional_info?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          code: string
          created_at: string
          description: string | null
          expiry_date: string | null
          id: string
          is_redeemed: boolean | null
          redeemed_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          user_id?: string
          value?: number
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
      badge_type:
        | "first_upload"
        | "viral_content"
        | "helpful_reviewer"
        | "explorer"
      content_category: "resep" | "hidden_gem" | "tips"
      notification_type: "like" | "comment" | "follow" | "badge" | "voucher"
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
    Enums: {
      badge_type: [
        "first_upload",
        "viral_content",
        "helpful_reviewer",
        "explorer",
      ],
      content_category: ["resep", "hidden_gem", "tips"],
      notification_type: ["like", "comment", "follow", "badge", "voucher"],
    },
  },
} as const
