"use server";

import { supabase } from "../libs/supabase";
import { OrderGroup, Order } from "@/types";
import { revalidatePath } from "next/cache";

export async function getOrderGroups() {
  const { data, error } = await supabase
    .from("order_groups")
    .select(
      `
      *,
      orders (*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching order groups:", error);
    return [];
  }

  return data as OrderGroup[];
}

export async function createOrderGroup(name: string) {
  const { data, error } = await supabase
    .from("order_groups")
    .insert({ name })
    .select()
    .single();

  if (error) {
    console.error("Error creating order group:", error);
    throw error;
  }

  revalidatePath("/");
  return data;
}

export async function createOrder(order: Omit<Order, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }

  revalidatePath("/");
  return data;
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating order:", error);
    throw error;
  }

  revalidatePath("/");
  return data;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) {
    console.error("Error deleting order:", error);
    throw error;
  }

  revalidatePath("/");
}

export async function deleteOrderGroup(id: string) {
  const { error } = await supabase.from("order_groups").delete().eq("id", id);

  if (error) {
    console.error("Error deleting order group:", error);
    throw error;
  }

  revalidatePath("/");
}
