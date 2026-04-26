export type BriefTemplate = 'statement' | 'media-rich';
export type BriefStatus = 'draft' | 'published' | 'deleted';
export type UserRole = 'mk' | 'admin';

type MkUserRow = {
  id: string;
  user_id: string;
  mk_id: number;
  party_id: number | null;
  role: UserRole;
  created_at: string;
};

type BriefRow = {
  id: string;
  mk_id: number;
  author_id: string;
  template: BriefTemplate;
  status: BriefStatus;
  title: string;
  subtitle: string | null;
  body: string | null;
  header_image: string | null;
  header_image_fit: 'cover' | 'contain';
  header_image_position_x: number;
  header_image_position_y: number;
  header_image_scale: number;
  video_url: string | null;
  tags: string[];
  publish_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type BriefMediaRow = {
  id: string;
  brief_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      mk_users: {
        Row: MkUserRow;
        Insert: Omit<MkUserRow, 'id' | 'created_at'>;
        Update: Partial<Omit<MkUserRow, 'id' | 'created_at'>>;
        Relationships: [];
      };
      briefs: {
        Row: BriefRow;
        Insert: {
          mk_id: number;
          author_id: string;
          template: BriefTemplate;
          status?: BriefStatus;
          title: string;
          subtitle?: string | null;
          body?: string | null;
          header_image?: string | null;
          header_image_fit?: 'cover' | 'contain';
          header_image_position_x?: number;
          header_image_position_y?: number;
          header_image_scale?: number;
          video_url?: string | null;
          tags?: string[];
          publish_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          status?: BriefStatus;
          title?: string;
          subtitle?: string | null;
          body?: string | null;
          header_image?: string | null;
          header_image_fit?: 'cover' | 'contain';
          header_image_position_x?: number;
          header_image_position_y?: number;
          header_image_scale?: number;
          video_url?: string | null;
          tags?: string[];
          publish_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      brief_media: {
        Row: BriefMediaRow;
        Insert: Omit<BriefMediaRow, 'id' | 'created_at'>;
        Update: Partial<Omit<BriefMediaRow, 'id' | 'created_at'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
