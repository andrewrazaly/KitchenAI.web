import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';

// In-memory store for inventory items (temporary solution)
export const inventoryStore = new Map<string, any[]>();

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const category = searchParams.get('category');

    // Get items for this user
    let items = inventoryStore.get(userId) || [];
    
    // Apply filters
    if (location) {
      items = items.filter(item => item.location === location);
    }
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    // Sort by expiry date
    items = items.sort((a, b) => {
      if (!a.expiry_date) return 1;
      if (!b.expiry_date) return -1;
      return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Create new item with ID
    const newItem = { 
      ...body, 
      id: Math.random().toString(36).substring(2, 15), 
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    // Get current items for this user
    const userItems = inventoryStore.get(userId) || [];
    
    // Add new item
    userItems.push(newItem);
    
    // Update store
    inventoryStore.set(userId, userItems);
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { id, ...updateData } = body;
    
    // Get current items for this user
    const userItems = inventoryStore.get(userId) || [];
    
    // Find item index
    const itemIndex = userItems.findIndex(item => item.id === id && item.user_id === userId);
    
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Update item
    const updatedItem = { ...userItems[itemIndex], ...updateData, updated_at: new Date().toISOString() };
    userItems[itemIndex] = updatedItem;
    
    // Update store
    inventoryStore.set(userId, userItems);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    // Get current items for this user
    const userItems = inventoryStore.get(userId) || [];
    
    // Find item index
    const itemIndex = userItems.findIndex(item => item.id === id && item.user_id === userId);
    
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Remove item
    const deletedItem = userItems[itemIndex];
    userItems.splice(itemIndex, 1);
    
    // Update store
    inventoryStore.set(userId, userItems);
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 