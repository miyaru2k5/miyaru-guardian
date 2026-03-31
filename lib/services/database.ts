import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase";

type BankAccount = Database["public"]["Tables"]["bank_accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type FacebookContact = Database["public"]["Tables"]["facebook_contacts"]["Row"];
type TermsPage = Database["public"]["Tables"]["terms_pages"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Trader = Database["public"]["Tables"]["traders"]["Row"];

export const bankAccountService = {
  list: () => supabase.from("bank_accounts").select("*").order("created_at", { ascending: false }),
  getById: (id: string) => supabase.from("bank_accounts").select("*").eq("id", id).single(),
  create: (data: Omit<BankAccount, "id" | "created_at" | "updated_at">) => 
    supabase.from("bank_accounts").insert([data]),
  update: (id: string, data: Partial<BankAccount>) => 
    supabase.from("bank_accounts").update(data).eq("id", id),
  delete: (id: string) => supabase.from("bank_accounts").delete().eq("id", id),
  toggleVisibility: (id: string, isVisible: boolean) => 
    supabase.from("bank_accounts").update({ is_visible: !isVisible }).eq("id", id),
};

export const categoryService = {
  list: () => supabase.from("categories").select("*").order("created_at", { ascending: false }),
  create: (name: string) => supabase.from("categories").insert([{ name }]),
  update: (id: string, name: string) => supabase.from("categories").update({ name }).eq("id", id),
  delete: async (id: string) => {
    await supabase.from("trader_categories").delete().eq("category_id", id);
    return supabase.from("categories").delete().eq("id", id);
  },
};

export const facebookContactService = {
  list: () => supabase.from("facebook_contacts").select("*").order("display_order", { ascending: true }),
  create: (data: Omit<FacebookContact, "id" | "created_at">) => 
    supabase.from("facebook_contacts").insert([data]),
  update: (id: string, data: Partial<FacebookContact>) => 
    supabase.from("facebook_contacts").update(data).eq("id", id),
  delete: (id: string) => supabase.from("facebook_contacts").delete().eq("id", id),
};

export const termsService = {
  list: () => supabase.from("terms_pages").select("*").order("created_at", { ascending: false }),
  getBySlug: (slug: string) => supabase.from("terms_pages").select("*").eq("slug", slug).single(),
  create: (data: Omit<TermsPage, "id" | "created_at" | "updated_at">) => 
    supabase.from("terms_pages").insert([data]),
  update: (id: string, data: Partial<TermsPage>) => 
    supabase.from("terms_pages").update(data).eq("id", id),
  delete: (id: string) => supabase.from("terms_pages").delete().eq("id", id),
};

export const transactionService = {
  list: () => supabase.from("transactions").select("*").order("created_at", { ascending: false }),
  create: (data: Omit<Transaction, "id" | "created_at">) => 
    supabase.from("transactions").insert([data]),
  updateStatus: (id: string, status: string) => 
    supabase.from("transactions").update({ status }).eq("id", id),
};

export const traderService = {
  list: () => supabase.from("traders").select("*").order("created_at", { ascending: true }),
  getWithCategories: async (traderId: string) => {
    const { data: trader } = await supabase.from("traders").select("*").eq("id", traderId).single();
    if (!trader) return null;
    const { data: categories } = await supabase
      .from("trader_categories")
      .select("category_id")
      .eq("trader_id", traderId);
    return { ...trader, categoryIds: categories?.map(c => c.category_id) || [] };
  },
  create: async (data: Omit<Trader, "id" | "created_at" | "updated_at">, categoryIds: string[]) => {
    const { data: trader, error } = await supabase.from("traders").insert([data]).select().single();
    if (error || !trader) return { trader: null, error };
    
    if (categoryIds.length > 0) {
      const categories = categoryIds.map(category_id => ({ trader_id: trader.id, category_id }));
      await supabase.from("trader_categories").insert(categories);
    }
    return { trader, error: null };
  },
  update: async (id: string, data: Partial<Trader>, categoryIds?: string[]) => {
    const { error } = await supabase.from("traders").update(data).eq("id", id);
    if (error) return { error };
    
    if (categoryIds !== undefined) {
      await supabase.from("trader_categories").delete().eq("trader_id", id);
      if (categoryIds.length > 0) {
        const categories = categoryIds.map(category_id => ({ trader_id: id, category_id }));
        await supabase.from("trader_categories").insert(categories);
      }
    }
    return { error: null };
  },
  updateStatus: (id: string, status: string) => 
    supabase.from("traders").update({ status }).eq("id", id),
  delete: async (id: string) => {
    await supabase.from("trader_categories").delete().eq("trader_id", id);
    return supabase.from("traders").delete().eq("id", id);
  },
};

export const insuranceFundService = {
  get: () => supabase.from("insurance_fund").select("*").limit(1).maybeSingle(),
  update: (id: string, data: { total_fund: number; currently_insured: number }) => 
    supabase.from("insurance_fund").update(data).eq("id", id),
  create: (data: { total_fund: number; currently_insured: number }) => 
    supabase.from("insurance_fund").insert([data]),
};
