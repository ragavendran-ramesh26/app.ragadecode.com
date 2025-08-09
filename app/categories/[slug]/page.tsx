// app/categories/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories } from '@/app/home/actions/getCategories';
import { getArticlesByCategory } from '../actions/getArticlesByCategory';
import ArticleCard from '@/app/[year]/[month]/[day]/_components/ArticleCard';
import BackFab from './BackFab';
import CategoryTabBar from './CategoryTabBar';
import BackButton from '@/app/article/[id]/BackButton';

export const dynamic = 'force-dynamic';
type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { slug } = await params;
    const { data } = await getCategories();
    const cat = data.find((c) => c.slug === slug);
    const title = cat?.seo_title || `${slug.replace(/-/g, ' ')} — Category | RagaDecode`;
    const description = cat?.meta_description || `Latest verified articles under ${slug.replace(/-/g, ' ')} on RagaDecode.`;
    return { title, description, openGraph: { title, description }, twitter: { card: 'summary_large_image', title, description } };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
    const { slug } = await params;
    const { data, error: catsErr } = await getCategories();
    if (catsErr) notFound();

    const cat = data.find((c) => c.slug === slug);
    if (!cat) notFound();

    const { items: articles, error, debug } = await getArticlesByCategory(slug);

    return (
        <main className="pb-24"> {/* no px-4 here */}
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur">
                    <div
                        className="px-4"
                        style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}
                    >
                        <div className="flex items-center gap-3 py-3">
                            <BackButton icon size={32} className="shrink-0 bg-white/95" />
                            <div className="min-w-0">
                                <h1 className="text-xl font-semibold leading-6">{cat.name}</h1>
                                <p className="text-sm text-gray-500 leading-5">
                                    {articles.length} article{articles.length === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content (same px-4 as header) */}
                <div className="px-4">
                    {!articles.length ? (
                        <div className="py-10 space-y-4">
                            <p className="text-center text-gray-600">
                                No articles found for <span className="font-medium">{cat.name}</span>.
                            </p>
                            {/* debug block if you still need it */}
                        </div>
                    ) : (
                        <ul className="mt-4 grid gap-3">
                            {articles.map((a, i) => {
                                const key =
                                    a.document_id ||
                                    (a.slug ? `slug:${a.slug}` : undefined) ||
                                    (a.id != null ? `id:${a.id}` : undefined) ||
                                    `idx:${i}`;
                                return <ArticleCard key={key} article={a as any} />;
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Bottom tabs */}
            <CategoryTabBar />
        </main>
    );
}
