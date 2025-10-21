
import EditStoryForm from './edit-story-form';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStoryPage({ params }: PageProps) {
  const { id } = await params;

  return <EditStoryForm id={id} />;
}
