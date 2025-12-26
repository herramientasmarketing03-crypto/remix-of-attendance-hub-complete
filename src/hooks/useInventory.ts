import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'equipment' | 'furniture' | 'technology' | 'software' | 'supplies' | 'vehicle' | 'other';
  description: string | null;
  quantity: number;
  unit: string;
  location: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_value: number | null;
  current_value: number | null;
  status: 'available' | 'in_use' | 'maintenance' | 'damaged' | 'disposed';
  assigned_to_employee: string | null;
  assigned_to_department: string | null;
  warranty_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryData {
  name: string;
  category: InventoryItem['category'];
  description?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_value?: number;
  current_value?: number;
  status?: InventoryItem['status'];
  assigned_to_employee?: string;
  assigned_to_department?: string;
  warranty_until?: string;
  notes?: string;
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setInventory((data as InventoryItem[]) || []);
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el inventario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData: CreateInventoryData) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      setInventory((prev) => [...prev, data as InventoryItem]);
      toast({
        title: 'Item agregado',
        description: 'El item ha sido registrado en el inventario',
      });
      return data;
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar el item',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setInventory((prev) =>
        prev.map((item) => (item.id === id ? (data as InventoryItem) : item))
      );
      toast({
        title: 'Item actualizado',
        description: 'Los cambios han sido guardados',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el item',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);

      if (error) throw error;

      setInventory((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: 'Item eliminado',
        description: 'El item ha sido eliminado del inventario',
      });
    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el item',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory,
    loading,
    fetchInventory,
    createItem,
    updateItem,
    deleteItem,
  };
}
