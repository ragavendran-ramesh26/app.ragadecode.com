export interface ArticleItem {
  title: string;
  document_id: string;
  slug: string;
  category: string;
  category_slug: string;
  country: string;
  state: string;
  city: string;
  image: string;
  short_description: string;
  author: string;
}

export interface HashtagGroup {
  hashtag: string;
  count: number;
  articles: ArticleItem[];
}

export interface CategoryGroup {
  category: string;
  article_count: number;
  hashtags: HashtagGroup[];
}

export interface IncidentData {
  data: CategoryGroup[];
  meta: Record<string, number>;
}
