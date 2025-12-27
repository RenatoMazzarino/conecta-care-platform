import type { Json } from '@/types/supabase';

export interface PolicyRuleSet {
  billing_rules?: Json;
  inventory_rules?: Json;
  scale_rules?: Json;
  document_rules?: Json;
  [key: string]: Json | undefined;
}

function isObject(value: unknown): value is Record<string, Json> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizePolicyRuleSet(value: Json | PolicyRuleSet | null | undefined): PolicyRuleSet {
  if (!value || !isObject(value)) {
    return {};
  }

  return {
    billing_rules: value.billing_rules ?? {},
    inventory_rules: value.inventory_rules ?? {},
    scale_rules: value.scale_rules ?? {},
    document_rules: value.document_rules ?? {},
    ...value,
  } as PolicyRuleSet;
}

export function resolvePolicyRules(ruleSet: Json | PolicyRuleSet | null | undefined) {
  const normalized = normalizePolicyRuleSet(ruleSet);
  return {
    billing: normalized.billing_rules ?? {},
    inventory: normalized.inventory_rules ?? {},
    scale: normalized.scale_rules ?? {},
    document: normalized.document_rules ?? {},
    raw: normalized,
  };
}
