import { connectDB } from '../config/db';
import { Furniture } from '../models/furniture.model';
import { FurnitureCategory } from '../models/furnitureCategory.model';

const furnitureData = [
  {
    name: 'Modern Dining Chair',
    category: 'chair',
    dimensions: { width: 0.5, length: 0.5, height: 1.0 },
    thumbnail: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
    thumbnailAlt: 'Modern Dining Chair',
    // Real GLB from KhronosGroup glTF-Sample-Assets (CC BY 4.0) — SheenChair
    model3D: {
      url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
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
    // Procedural — no matching free CDN table GLB available
    model3D: {
      url: 'procedural://dining-table',
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
    // Real GLB from KhronosGroup glTF-Sample-Assets (CC BY 4.0) — SheenWoodLeatherSofa
    model3D: {
      url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenWoodLeatherSofa/glTF-Binary/SheenWoodLeatherSofa.glb',
      format: 'glb' as const,
    },
    defaultColor: '#4A4A4A',
    isColorizable: false,
    price: 899.99,
    stock: 15,
  },
  {
    name: 'Side Table',
    category: 'table',
    dimensions: { width: 0.5, length: 0.5, height: 0.6 },
    thumbnail: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=300&fit=crop',
    thumbnailAlt: 'Side Table',
    // Procedural — no matching free CDN side table GLB available
    model3D: {
      url: 'procedural://side-table',
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
    // Procedural — no matching free CDN bed GLB available
    model3D: {
      url: 'procedural://queen-bed',
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
    // Procedural — no matching free CDN bookshelf GLB available
    model3D: {
      url: 'procedural://bookshelf',
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
    // Procedural — no matching free CDN coffee table GLB available
    model3D: {
      url: 'procedural://coffee-table',
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

    console.log('🏷️  Ensuring default furniture categories...');
    const defaultCategories = [
      { slug: 'chair', label: 'Chairs' },
      { slug: 'table', label: 'Tables' },
      { slug: 'sofa', label: 'Sofas' },
      { slug: 'bed', label: 'Beds' },
      { slug: 'storage', label: 'Storage' },
    ];
    for (const c of defaultCategories) {
      // Upsert so re-running the seed is safe.
      await FurnitureCategory.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });
    }

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
