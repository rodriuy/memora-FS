
import StoryDetailPage from './story-detail-page';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;

  return <StoryDetailPage id={id} />;
}
