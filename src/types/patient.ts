/**
 * @deprecated Tipos provisórios (UI antiga/mocks). Preferir tipos gerados em `src/types/supabase.ts`.
 */
export interface DadosPessoais {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: 'M' | 'F' | 'Outro';
  estado_civil: string;
  rg?: string;
  orgao_emissor_rg?: string;
  telefone_principal: string;
  telefone_secundario?: string;
  email?: string;
  foto_url?: string;
}

export interface Endereco {
  id: string;
  paciente_id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  referencia?: string;
  instrucoes_acesso?: string;
  latitude?: number;
  longitude?: number;
}

export interface RedeApoio {
  id: string;
  paciente_id: string;
  nome: string;
  parentesco: string;
  telefone: string;
  email?: string;
  is_responsavel_legal: boolean;
  is_contato_emergencia: boolean;
  observacoes?: string;
}

export interface Administrativo {
  id: string;
  paciente_id: string;
  convenio?: string;
  numero_carteirinha?: string;
  validade_carteirinha?: string;
  plano?: string;
  data_inicio_atendimento?: string;
  data_fim_atendimento?: string;
  status: 'ativo' | 'inativo' | 'pendente' | 'suspenso';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Paciente {
  dados_pessoais: DadosPessoais;
  endereco?: Endereco;
  rede_apoio: RedeApoio[];
  administrativo?: Administrativo;
}

export type PatientTab =
  | 'dados-pessoais'
  | 'endereco-logistica'
  | 'rede-apoio'
  | 'administrativo'
  | 'financeiro'
  | 'clinico'
  | 'documentos'
  | 'historico';
