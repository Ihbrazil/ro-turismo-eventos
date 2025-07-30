// =========================
//  INÍCIO: counter.js
// =========================
function setupCounter(element) {
  let counter = 0
  const setCounter = (count) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
// =========================
//  FIM: counter.js
// =========================

// =========================
//  INÍCIO: utils.js
// =========================
// Utilitários gerais
const Utils = {
  // Aplica máscara no DDD (apenas números, máximo 2)
  maskDDD(value) {
    return value.replace(/\D/g, '').substring(0, 2);
  },

  // Aplica máscara no telefone (apenas números, máximo 9)
  maskPhone(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{4})(\d{4})/, '$1-$2');
    } else {
      return numbers.substring(0, 9).replace(/(\d{5})(\d{4})/, '$1-$2');
    }
  },

  // Remove formatação do telefone
  cleanPhone(value) {
    return value.replace(/\D/g, '');
  },

  // Formata telefone completo para exibição
  formatFullPhone(ddd, numero) {
    const cleanDDD = this.cleanPhone(ddd);
    const cleanNumero = this.cleanPhone(numero);
    return `(${cleanDDD}) ${this.maskPhone(cleanNumero)}`;
  },

  // Sanitiza entrada de nome
  sanitizeName(value) {
    return value.trim().replace(/\s+/g, ' ');
  },

  // Mostra elemento com animação
  showElement(element, className = 'show') {
    element.classList.add(className);
  },

  // Esconde elemento com animação
  hideElement(element, className = 'show') {
    element.classList.remove(className);
  },

  // Debounce para validação em tempo real
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Gera timestamp para logs
  getTimestamp() {
    return new Date().toISOString();
  },

  // Log melhorado para debugging
  log(message, type = 'info', data = null) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    
    console[type === 'error' ? 'error' : 'log'](logMessage, data || '');
  }
};
// =========================
//  FIM: utils.js
// =========================

// =========================
//  INÍCIO: config.js
// =========================
// Configurações do Supabase
const SUPABASE_CONFIG = {
  endpoint: 'https://zwvisfrdzizehayydrcg.supabase.co/rest/v1/bd_leads_roturismoeeventos', // URL do Supabase
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dmlzZnJkeml6ZWhheXlkcmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjQ0MjAsImV4cCI6MjA2ODM0MDQyMH0.ctL6jvT0VUsYUF-VZ0i1W449ZX5xDSQBBVHCGmQpckI',
  headers: {
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  }
};

// Configurações de validação
const VALIDATION_CONFIG = {
  nome: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/
  },
  ddd: {
    minLength: 2,
    maxLength: 2,
    pattern: /^\d{2}$/
  },
  numero: {
    minLength: 8,
    maxLength: 9,
    pattern: /^\d{8,9}$/
  }
};

// Mensagens de erro
const ERROR_MESSAGES = {
  nome: {
    required: 'Nome é obrigatório',
    minLength: 'Nome deve ter pelo menos 2 caracteres',
    maxLength: 'Nome deve ter no máximo 100 caracteres',
    pattern: 'Nome deve conter apenas letras e espaços'
  },
  ddd: {
    required: 'DDD é obrigatório',
    pattern: 'DDD deve conter apenas 2 números'
  },
  numero: {
    required: 'Número do telefone é obrigatório',
    pattern: 'Número deve conter entre 8 e 9 dígitos'
  },
  api: {
    network: 'Erro de conexão. Verifique sua internet e tente novamente.',
    server: 'Erro no servidor. Tente novamente em alguns minutos.',
    unknown: 'Erro inesperado. Tente novamente.'
  }
};
// =========================
//  FIM: config.js
// =========================

// =========================
//  INÍCIO: validation.js
// =========================
// Sistema de validação
const Validator = {
  // Valida um campo individual
  validateField(fieldName, value) {
    const config = VALIDATION_CONFIG[fieldName];
    const messages = ERROR_MESSAGES[fieldName];
    
    if (!config || !messages) {
      return { isValid: true, message: '' };
    }

    // Verifica se está vazio
    if (!value || value.trim() === '') {
      return { isValid: false, message: messages.required };
    }

    // Sanitiza valor baseado no tipo
    let sanitizedValue = value;
    if (fieldName === 'nome') {
      sanitizedValue = Utils.sanitizeName(value);
    } else if (fieldName === 'ddd' || fieldName === 'numero') {
      sanitizedValue = Utils.cleanPhone(value);
    }

    // Validação customizada para DDD
    if (fieldName === 'ddd') {
      if (!Validator.isValidDDD(sanitizedValue)) {
        return { isValid: false, message: messages.pattern };
      }
    }

    // Verifica tamanho mínimo
    if (config.minLength && sanitizedValue.length < config.minLength) {
      return { isValid: false, message: messages.minLength };
    }

    // Verifica tamanho máximo
    if (config.maxLength && sanitizedValue.length > config.maxLength) {
      return { isValid: false, message: messages.maxLength };
    }

    // Verifica padrão
    if (config.pattern && !config.pattern.test(sanitizedValue)) {
      return { isValid: false, message: messages.pattern };
    }

    return { isValid: true, message: '' };
  },

  // Valida se o DDD é válido
  isValidDDD(ddd) {
    // Lista de DDDs válidos no Brasil
    const validDDDs = [
      '11', '12', '13', '14', '15', '16', '17', '18', '19', // São Paulo
      '21', '22', '24', // Rio de Janeiro
      '27', '28', // Espírito Santo
      '31', '32', '33', '34', '35', '37', '38', // Minas Gerais
      '41', '42', '43', '44', '45', '46', // Paraná
      '47', '48', '49', // Santa Catarina
      '51', '53', '54', '55', // Rio Grande do Sul
      '61', // Distrito Federal
      '62', '64', // Goiás
      '63', // Tocantins
      '65', '66', // Mato Grosso
      '67', // Mato Grosso do Sul
      '68', // Acre
      '69', // Rondônia
      '71', '73', '74', '75', '77', // Bahia
      '79', // Sergipe
      '81', '87', // Pernambuco
      '82', // Alagoas
      '83', // Paraíba
      '84', // Rio Grande do Norte
      '85', '88', // Ceará
      '86', '89', // Piauí
      '91', '93', '94', // Pará
      '92', '97', // Amazonas
      '95', // Roraima
      '96', // Amapá
      '98', '99' // Maranhão
    ];
    return validDDDs.includes(ddd);
  },

  // Valida todos os campos do formulário
  validateForm(formData) {
    const results = {
      isValid: true,
      errors: {}
    };

    // Valida nome
    const nomeValidation = this.validateField('nome', formData.nome);
    if (!nomeValidation.isValid) {
      results.isValid = false;
      results.errors.nome = nomeValidation.message;
    }

    // Valida DDD
    const dddValidation = this.validateField('ddd', formData.ddd);
    if (!dddValidation.isValid) {
      results.isValid = false;
      results.errors.ddd = dddValidation.message;
    }

    // Valida número
    const numeroValidation = this.validateField('numero', formData.numero);
    if (!numeroValidation.isValid) {
      results.isValid = false;
      results.errors.numero = numeroValidation.message;
    }

    // Se DDD ou número tem erro, mostra erro geral de telefone
    if (results.errors.ddd || results.errors.numero) {
      results.errors.telefone = results.errors.ddd || results.errors.numero;
    }

    return results;
  },

  // Mostra erro em campo específico
  showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}Error`) || 
                        document.getElementById('telefoneError');

    if (input) {
      input.classList.add('error');
    }

    if (errorElement) {
      errorElement.textContent = message;
      Utils.showElement(errorElement);
    }
  },

  // Remove erro de campo específico
  clearFieldError(fieldName) {
    const input = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}Error`) || 
                        document.getElementById('telefoneError');

    if (input) {
      input.classList.remove('error');
    }

    if (errorElement) {
      errorElement.textContent = '';
      Utils.hideElement(errorElement);
    }
  },

  // Remove todos os erros
  clearAllErrors() {
    ['nome', 'ddd', 'numero'].forEach(field => {
      this.clearFieldError(field);
    });
  }
};
// =========================
//  FIM: validation.js
// =========================

// =========================
//  INÍCIO: api.js
// =========================
// API para comunicação com Supabase
const API = {
  // Envia dados para Supabase
  async submitLead(leadData) {
    try {
      Utils.log('Iniciando envio de lead', 'info', leadData);

      const response = await fetch(SUPABASE_CONFIG.endpoint, {
        method: 'POST',
        headers: {
          ...SUPABASE_CONFIG.headers,
          'apikey': SUPABASE_CONFIG.apiKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.apiKey}`
        },
        body: JSON.stringify(leadData)
      });

      Utils.log(`Resposta da API: ${response.status}`, 'info');

      if (!response.ok) {
        const errorData = await response.text();
        Utils.log('Erro na API', 'error', {
          status: response.status,
          statusText: response.statusText,
          body: errorData
        });

        throw new Error(this.getErrorMessage(response.status));
      }

      Utils.log('Lead enviado com sucesso', 'info');
      return { success: true };

    } catch (error) {
      Utils.log('Erro ao enviar lead', 'error', error);

      // Verifica se é erro de rede
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(ERROR_MESSAGES.api.network);
      }

      // Se já é uma mensagem tratada, repassa
      if (error.message.includes('Erro de conexão') || 
          error.message.includes('Erro no servidor') ||
          error.message.includes('Erro inesperado')) {
        throw error;
      }

      // Erro genérico
      throw new Error(ERROR_MESSAGES.api.unknown);
    }
  },

  // Retorna mensagem de erro baseada no status HTTP
  getErrorMessage(status) {
    switch (status) {
      case 400:
      case 422:
        return 'Dados inválidos. Verifique as informações e tente novamente.';
      case 401:
      case 403:
        return 'Erro de autenticação. Tente novamente.';
      case 404:
        return 'Serviço não encontrado. Tente novamente mais tarde.';
      case 429:
        return 'Muitas tentativas. Aguarde um momento e tente novamente.';
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.api.server;
      default:
        return ERROR_MESSAGES.api.unknown;
    }
  },

  // Prepara dados para envio
  prepareLead(formData) {
    const dddClean = Utils.cleanPhone(formData.ddd);
    const numeroClean = Utils.cleanPhone(formData.numero);
    // Formata para (32) 99999-9999
    let telefoneFormatado = '';
    if (dddClean && numeroClean) {
      if (numeroClean.length === 8) {
        // Fixo: 8 dígitos
        telefoneFormatado = `(${dddClean}) ${numeroClean.replace(/(\d{4})(\d{4})/, '$1-$2')}`;
      } else {
        // Celular: 9 dígitos
        telefoneFormatado = `(${dddClean}) ${numeroClean.replace(/(\d{5})(\d{4})/, '$1-$2')}`;
      }
    }
    return {
      nome: Utils.sanitizeName(formData.nome),
      telefone: telefoneFormatado
    };
  }
};
// =========================
//  FIM: api.js
// =========================

// =========================
//  INÍCIO: script.js (LeadCaptureApp)
// =========================
// Script principal da aplicação
class LeadCaptureApp {
  constructor() {
    this.form = document.getElementById('leadForm');
    this.submitButton = document.getElementById('submitButton');
    this.successMessage = document.getElementById('successMessage');
    this.inputs = {
      nome: document.getElementById('nome'),
      ddd: document.getElementById('ddd'),
      numero: document.getElementById('numero')
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupInputMasks();
    this.setupValidation();
    Utils.log('Aplicação inicializada com sucesso', 'info');
  }

  setupEventListeners() {
    // Submit do formulário
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Clique no sucesso para resetar
    this.successMessage.addEventListener('click', () => {
      this.resetForm();
    });

    // Enter para submeter
    Object.values(this.inputs).forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSubmit();
        }
      });
    });
  }

  setupInputMasks() {
    // Máscara para DDD
    this.inputs.ddd.addEventListener('input', (e) => {
      const masked = Utils.maskDDD(e.target.value);
      e.target.value = masked;
    });

    // Máscara para número
    this.inputs.numero.addEventListener('input', (e) => {
      const masked = Utils.maskPhone(e.target.value);
      e.target.value = masked;
    });

    // Permite apenas letras no nome
    this.inputs.nome.addEventListener('input', (e) => {
      const value = e.target.value;
      const sanitized = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
      if (value !== sanitized) {
        e.target.value = sanitized;
      }
    });
  }

  setupValidation() {
    // Validação em tempo real com debounce
    const debouncedValidation = Utils.debounce((fieldName, value) => {
      const validation = Validator.validateField(fieldName, value);
      if (!validation.isValid) {
        Validator.showFieldError(fieldName, validation.message);
      } else {
        Validator.clearFieldError(fieldName);
      }
    }, 500);

    // Aplica validação em tempo real
    Object.keys(this.inputs).forEach(fieldName => {
      this.inputs[fieldName].addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.trim() !== '') {
          debouncedValidation(fieldName, value);
        } else {
          Validator.clearFieldError(fieldName);
        }
      });

      // Limpa erro ao focar
      this.inputs[fieldName].addEventListener('focus', () => {
        Validator.clearFieldError(fieldName);
      });
    });
  }

  getFormData() {
    return {
      nome: this.inputs.nome.value.trim(),
      ddd: this.inputs.ddd.value.trim(),
      numero: this.inputs.numero.value //Utils.cleanPhone(this.inputs.numero.value)
    };
  }

  async handleSubmit() {
    try {
      // Previne múltiplos submits
      if (this.submitButton.disabled) return;

      // Limpa erros anteriores
      Validator.clearAllErrors();

      // Pega dados do formulário
      const formData = this.getFormData();

      // Valida dados
      const validation = Validator.validateForm(formData);
      if (!validation.isValid) {
        this.showValidationErrors(validation.errors);
        return;
      }

      // Mostra loading
      this.setLoading(true);

      // Prepara dados para API
      const leadData = API.prepareLead(formData);

      // Envia para API
      await API.submitLead(leadData);

      // Mostra sucesso
      this.showSuccess();

      Utils.log('Formulário enviado com sucesso', 'info', leadData);

    } catch (error) {
      Utils.log('Erro no envio do formulário', 'error', error);
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  showValidationErrors(errors) {
    // Foca no primeiro campo com erro
    let firstErrorField = null;

    Object.keys(errors).forEach(field => {
      if (field === 'telefone') {
        Validator.showFieldError('telefone', errors[field]);
        if (!firstErrorField) firstErrorField = this.inputs.ddd;
      } else {
        Validator.showFieldError(field, errors[field]);
        if (!firstErrorField) firstErrorField = this.inputs[field];
      }
    });

    // Foca no primeiro campo com erro
    if (firstErrorField) {
      setTimeout(() => firstErrorField.focus(), 100);
    }
  }

  showError(message) {
    // Mostra erro em um campo genérico ou alerta
    const errorElement = document.getElementById('telefoneError');
    if (errorElement) {
      errorElement.textContent = message;
      Utils.showElement(errorElement);
    } else {
      alert(`Erro: ${message}`);
    }
  }

  setLoading(isLoading) {
    this.submitButton.disabled = isLoading;
    
    if (isLoading) {
      this.submitButton.classList.add('loading');
    } else {
      this.submitButton.classList.remove('loading');
    }

    // Desabilita inputs durante loading
    Object.values(this.inputs).forEach(input => {
      input.disabled = isLoading;
    });
  }

  showSuccess() {
    Utils.showElement(this.successMessage);
    
    // Auto-reset após 5 segundos
    setTimeout(() => {
      this.resetForm();
    }, 5000);
  }

  resetForm() {
    // Esconde mensagem de sucesso
    Utils.hideElement(this.successMessage);

    // Limpa formulário
    this.form.reset();

    // Limpa erros
    Validator.clearAllErrors();

    // Foca no primeiro campo
    this.inputs.nome.focus();

    Utils.log('Formulário resetado', 'info');
  }
}

// Inicializa a aplicação quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  new LeadCaptureApp();
});
// =========================
//  FIM: script.js
// =========================
