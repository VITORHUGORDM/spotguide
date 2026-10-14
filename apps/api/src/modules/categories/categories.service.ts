import { prisma } from '../../shared/database/prisma.js';
import { CategoryResponse } from '@guia/contracts';

export class CategoriesService {
  async listAll(): Promise<CategoryResponse[]> {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      iconName: cat.iconName,
    }));
  }
}
