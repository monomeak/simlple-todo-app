import DashboardHome from "../../components/dashboard/DashboardHome";

type CategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;

  return <DashboardHome categoryId={categoryId} />;
}
