import { redirect } from "next/navigation";

type CategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;

  redirect(`/categories/${categoryId}`);
}
