import { supabase } from "@/lib/supabase";

export interface Module {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  is_active: boolean;
  display_order: number;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: string;
  max_instances: number;
  max_contacts: number;
  max_members: number;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  plan?: Plan;
}

export const subscriptionService = {
  async getWorkspaceSubscription(workspaceId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('subscriptionService.get error:', error.message);
      return null;
    }
    return data;
  },

  async getWorkspaceModules(workspaceId: string): Promise<Module[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        plan_id,
        plans!inner(
          plan_modules(
            modules(*)
          )
        )
      `)
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn('subscriptionService.modules error:', error?.message);
      return [];
    }

    const plan = data.plans as any;
    if (!plan?.plan_modules) return [];

    return plan.plan_modules
      .map((pm: any) => pm.modules)
      .filter((m: any) => m && m.is_active)
      .sort((a: Module, b: Module) => a.display_order - b.display_order);
  },

  async getAllModules(): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) return [];
    return data || [];
  },

  async getAllPlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) return [];
    return data || [];
  },
};
