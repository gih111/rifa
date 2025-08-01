import { PixResponse } from '../types';

// Novas constantes da API
const BUCKPAY_TOKEN = 'ATENÇÃO: Insira seu token de produção aqui'; 
const BUCKPAY_API_URL = 'https://api.realtechdev.com.br/v1/transactions';

export async function gerarPix(
  name: string,
  email: string,
  cpf: string,
  phone: string,
  amountReais: number, // Valor em Reais (ex: 20.00)
  itemName: string,
  utmQuery?: string
): Promise<PixResponse> {
  if (!navigator.onLine) {
    throw new Error('Sem conexão com a internet. Por favor, verifique sua conexão e tente novamente.');
  }

  const requestBody = {
    value: amountReais,
    payer_name: name,
    payer_document: cpf,
    payer_email: email,
    payer_phone: phone,
  };

  try {
    console.log('Enviando requisição PIX para a BuckPay:', {
      url: BUCKPAY_API_URL,
      body: requestBody
    });

    const response = await fetch(BUCKPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BUCKPAY_TOKEN}`,
        'Accept': 'application/json',
        // Adiciona o User-Agent conforme solicitado pelo suporte
        'User-Agent': 'Buckpay API'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Erro na resposta da API:', data);
        throw new Error(data.message || `Erro ${response.status} ao processar a requisição.`);
    }

    if (!data.image || !data.emv || !data.status || !data.id) {
      console.error('Resposta inválida da API BuckPay:', data);
      throw new Error('Resposta incompleta do servidor. Por favor, tente novamente.');
    }
    
    return {
      pixQrCode: data.image,
      pixCode: data.emv,
      status: data.status,
      id: data.id.toString(),
    };

  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    throw error;
  }
}

export async function verificarStatusPagamento(transactionId: string): Promise<string> {
  try {
    const response = await fetch(`${BUCKPAY_API_URL}/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BUCKPAY_TOKEN}`,
        'Accept': 'application/json',
        // Adiciona o User-Agent também na verificação de status
        'User-Agent': 'Buckpay API'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${response.status}`);
    }

    const data = await response.json();
    return data.status || 'pending';

  } catch (error) {
    console.error('Erro ao verificar o status do pagamento:', error);
    return 'error';
  }
}
