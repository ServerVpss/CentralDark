import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  title: string;
  description: string | null;
  price: number;
  days: number;
  is_active: boolean;
  is_popular: boolean;
  features: string[];
  max_bots: number;
  max_messages_per_day: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PendingPayment {
  id: string;
  user_id: string;
  plan_id: string;
  plan_code: string;
  plan_name: string;
  plan_days: number;
  txid: string;
  loc_id: string | null;
  value: number;
  pix_qrcode: string | null;
  pix_copy_paste: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

export interface TelegramSubscription {
  id: string;
  telegram_user_id: number;
  bot_id: string | null;
  plan_id: string | null;
  plan_code: string;
  plan_name: string;
  plan_days: number;
  txid: string | null;
  value: number;
  status: string | null;
  started_at: string;
  expires_at: string;
  created_at: string;
}

export interface PaymentGatewaySettings {
  id: string;
  user_id: string;
  gateway_type: string;
  is_sandbox: boolean;
  pix_key: string | null;
  webhook_url: string | null;
  auto_approve: boolean;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EfiGatewayConfig {
  id: string;
  user_id: string;
  name: string;
  gateway_type: string;
  config: {
    client_id: string;
    client_secret: string;
    pix_key: string;
  };
  proxy_url: string | null;
  min_deposit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePayments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch subscription plans
  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Fetch telegram subscriptions (active ones)
  const { data: telegramSubscriptions = [], isLoading: loadingSubscription } = useQuery({
    queryKey: ['telegram-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_subscriptions')
        .select('*')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false });

      if (error) throw error;
      return data as TelegramSubscription[];
    },
  });

  // Fetch pending payments
  const { data: pendingPayments = [], isLoading: loadingPending } = useQuery({
    queryKey: ['pending-payments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'PENDING')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PendingPayment[];
    },
    enabled: !!user,
  });

  // Fetch gateway settings
  const { data: gatewaySettings, isLoading: loadingSettings } = useQuery({
    queryKey: ['gateway-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('payment_gateway_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as PaymentGatewaySettings | null;
    },
    enabled: !!user,
  });

  // Fetch EFI gateway config (from payment_gateways table)
  const { data: efiGateway, isLoading: loadingEfiGateway } = useQuery({
    queryKey: ['efi-gateway', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('user_id', user.id)
        .eq('gateway_type', 'efi')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as EfiGatewayConfig | null;
    },
    enabled: !!user,
  });

  // Create PIX payment
  const createPixPayment = useMutation({
    mutationFn: async (planCode: string) => {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('pix-payment', {
        body: { action: 'create', planCode },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      return data.payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      toast.success('PIX gerado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao gerar PIX: ${error.message}`);
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  // Check payment status
  const checkPaymentStatus = useMutation({
    mutationFn: async (txid: string) => {
      const { data, error } = await supabase.functions.invoke('pix-payment', {
        body: { action: 'check', txid },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.isPaid) {
        queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
        queryClient.invalidateQueries({ queryKey: ['telegram-subscriptions'] });
        toast.success('Pagamento confirmado! Assinatura ativada.');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao verificar pagamento: ${error.message}`);
    },
  });

  // Update gateway settings
  const updateGatewaySettings = useMutation({
    mutationFn: async (settings: Partial<PaymentGatewaySettings>) => {
      if (!user) throw new Error('Não autenticado');
      
      const { data: existing } = await supabase
        .from('payment_gateway_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('payment_gateway_settings')
          .update(settings)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_gateway_settings')
          .insert({ ...settings, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway-settings'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });

  // Update EFI gateway config
  const updateEfiGateway = useMutation({
    mutationFn: async (config: { 
      client_id: string; 
      client_secret: string; 
      pix_key: string;
      min_deposit?: number;
      is_active?: boolean;
      proxy_url?: string;
    }) => {
      if (!user) throw new Error('Não autenticado');
      
      const { data: existing } = await supabase
        .from('payment_gateways')
        .select('id')
        .eq('user_id', user.id)
        .eq('gateway_type', 'efi')
        .maybeSingle();

      const gatewayData = {
        name: 'EFI (Gerencianet) PIX',
        gateway_type: 'efi',
        config: {
          client_id: config.client_id,
          client_secret: config.client_secret,
          pix_key: config.pix_key,
        },
        min_deposit: config.min_deposit ?? 2,
        is_active: config.is_active ?? true,
        proxy_url: config.proxy_url ?? 'https://api.segredounlock.com/efi-generate-pix.php',
        user_id: user.id,
      };

      if (existing) {
        const { error } = await supabase
          .from('payment_gateways')
          .update(gatewayData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_gateways')
          .insert(gatewayData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['efi-gateway'] });
      toast.success('Gateway EFI configurado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar gateway: ${error.message}`);
    },
  });

  // Update plan
  const updatePlan = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SubscriptionPlan> }) => {
      const { error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plano atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar plano: ${error.message}`);
    },
  });

  // Create new plan
  const createPlan = useMutation({
    mutationFn: async (plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('subscription_plans')
        .insert({
          code: plan.code,
          name: plan.name,
          title: plan.title,
          description: plan.description,
          price: plan.price,
          days: plan.days,
          is_active: plan.is_active,
          is_popular: plan.is_popular,
          features: plan.features,
          max_bots: plan.max_bots,
          max_messages_per_day: plan.max_messages_per_day,
          user_id: user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plano criado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar plano: ${error.message}`);
    },
  });

  // Delete plan
  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plano excluído!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir plano: ${error.message}`);
    },
  });

  // Get current subscription for display (first active one)
  const currentSubscription = telegramSubscriptions[0] || null;

  const isSubscriptionActive = currentSubscription && 
    new Date(currentSubscription.expires_at) > new Date();

  const daysRemaining = currentSubscription 
    ? Math.ceil((new Date(currentSubscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    plans,
    currentSubscription,
    telegramSubscriptions,
    pendingPayments,
    gatewaySettings,
    efiGateway,
    isSubscriptionActive,
    daysRemaining,
    isProcessing,
    loadingPlans,
    loadingSubscription,
    loadingPending,
    loadingSettings,
    loadingEfiGateway,
    createPixPayment,
    checkPaymentStatus,
    updateGatewaySettings,
    updateEfiGateway,
    updatePlan,
    createPlan,
    deletePlan,
  };
}
