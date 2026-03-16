import { connectDB } from '../config/db';
import { Furniture } from '../models/furniture.model';

const furnitureData = [
  {
    name: 'Modern Dining Chair',
    category: 'chair',
    dimensions: { width: 0.5, length: 0.5, height: 1.0 },
    thumbnail: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
    thumbnailAlt: 'Modern Dining Chair',
    model3D: {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/chair.glb',
      format: 'glb' as const,
    },
    defaultColor: '#8B4513',
    isColorizable: true,
    price: 149.99,
    stock: 50,
  },
  {
    name: 'Dining Table',
    category: 'table',
    dimensions: { width: 1.8, length: 1.0, height: 0.75 },
    thumbnail: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
    thumbnailAlt: 'Dining Table',
    model3D: {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/table.glb',
      format: 'glb' as const,
    },
    defaultColor: '#654321',
    isColorizable: true,
    price: 599.99,
    stock: 25,
  },
  {
    name: 'Three-Seater Sofa',
    category: 'sofa',
    dimensions: { width: 2.2, length: 0.9, height: 0.85 },
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    thumbnailAlt: 'Three-Seater Sofa',
    model3D: {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/sofa.glb',
      format: 'glb' as const,
    },
    defaultColor: '#4A4A4A',
    isColorizable: true,
    price: 899.99,
    stock: 15,
  },
  {
    name: 'Side Table',
    category: 'table',
    dimensions: { width: 0.5, length: 0.5, height: 0.6 },
    thumbnail: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=300&fit=crop',
    thumbnailAlt: 'Side Table',
    model3D: {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/table.glb',
      format: 'glb' as const,
    },
    defaultColor: '#8B7355',
    isColorizable: true,
    price: 199.99,
    stock: 40,
  },
  {
    name: 'Queen Bed',
    category: 'bed',
    dimensions: { width: 2.0, length: 1.6, height: 0.5 },
    thumbnail: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop',
    thumbnailAlt: 'Queen Bed',
    model3D: {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bed.glb',
      format: 'glb' as const,
    },
    defaultColor: '#F5F5DC',
    isColorizable: true,
    price: 1299.99,
    stock: 12,
  },
  {
    name: 'Bookshelf',
    category: 'storage',
    dimensions: { width: 1.2, length: 0.4, height: 2.0 },
    thumbnail: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=300&fit=crop',
    thumbnailAlt: 'Bookshelf',
    model3D: {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/shelf.glb',
      format: 'glb' as const,
    },
    defaultColor: '#8B4513',
    isColorizable: false,
    price: 399.99,
    stock: 20,
  },
  {
    name: 'Coffee Table',
    category: 'table',
    dimensions: { width: 1.2, length: 0.7, height: 0.45 },
    thumbnail: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop',
    thumbnailAlt: 'Coffee Table',
    model3D: {
      url: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/table.glb',
      format: 'glb' as const,
    },
    defaultColor: '#D2691E',
    isColorizable: true,
    price: 349.99,
    stock: 30,
  },
];

const seedFurniture = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing furniture...');
    await Furniture.deleteMany({});

    console.log('🌱 Seeding furniture data...');
    const createdFurniture = await Furniture.insertMany(furnitureData);

    console.log(`✅ Successfully seeded ${createdFurniture.length} furniture items:`);
    createdFurniture.forEach((item) => {
      console.log(`   - ${item.name} (${item.category}) - $${item.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding furniture:', error);
    process.exit(1);
  }
};

seedFurniture();
