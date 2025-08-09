// app/home/page.tsx
import { getTimelineCounts } from './actions/getTimelineCounts';
import { getCategories } from './actions/getCategories';
import ClientHomePage from './ClientHomePage';
import { getArticlesForHashtags } from './actions/getArticlesByHashtag';

export default async function HomePage() {
    const today = new Date();

    // Fetch SmartTimeline counts
    const items = await getTimelineCounts(today);

    // Fetch categories
    const { data: categories, error: categoriesError } = await getCategories();
    const tags = ['viral', 'murder', 'rape', 'accident'];
    const { data: decks, error: decksError } = await getArticlesForHashtags(tags, 12);

    return (
        <ClientHomePage
            todayISO={today.toISOString().slice(0, 10)}
            items={items}
            categories={categories}
            categoriesError={categoriesError}
            decks={decks}
            decksError={decksError}
        />
    );
}
