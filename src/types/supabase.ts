export interface Database {
  public: {
    Tables: {
      user_emails: {
        Row: {
          id: string;
          wallet_address: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          email?: string;
          created_at?: string;
        };
      };
    };
  };
}