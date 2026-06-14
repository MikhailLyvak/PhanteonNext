export type Webinar = {
  id: number;
  name: string;
  description: string;
  date: string;
  link: string;
  is_active: boolean;
  price?: number;
  is_free: boolean;
  subscription_types?: string[];
  has_access?: boolean;
}