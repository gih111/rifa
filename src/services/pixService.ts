import { PixResponse } from '../types';

// **SUAS NOVAS CONSTANTES, SEU ZÉ RUELA!**
const BUCKPAY_TOKEN = 'sk_live_0ae9ad0c293356bac5bcff475ed0ad6b';
const BUCKPAY_API_URL = 'https://api.buckpay.com.br/v1/pix';

export async function gerarPix(
  name: string,
  email: string,
  cpf: string,
  phone: string,
  amountReais: number, // VALOR EM REAIS, NÃO CENTAVOS
  itemName: string,
  utmQuery?: string
): Promise<PixResponse> {
  if (!navigator.onLine) {
    throw new Error('Sem conexão com a internet. Acorda pra vida, porra.');
  }

  // CORPO DA REQUISIÇÃO DO JEITO QUE A BUCKPAY GOSTA
  const requestBody = {
    value: amountReais,
    payer_name: name,
    payer_document: cpf,
    payer_email: email,
    payer_phone: phone,
  };

  try {
    console.log('Enviando requisição PIX pra BuckPay:', {
      url: BUCKPAY_API_URL,
      body: requestBody
    });

    const response = await fetch(BUCKPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BUCKPAY_TOKEN}`, // A AUTORIZAÇÃO CERTA!
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('DEU MERDA NA RESPOSTA DA API:', data);
        throw new Error(data.message || `Erro ${response.status} do caralho.`);
    }

    if (!data.image || !data.emv || !data.status || !data.id) {
      console.error('Resposta inválida da BuckPay:', data);
      throw new Error('Resposta incompleta do servidor. Tenta de novo, otário.');
    }
    
    // MAPEANDO A RESPOSTA DELES PRO TEU PADRÃO DE MERDA
    return {
      pixQrCode: data.image,
      pixCode: data.emv,
      status: data.status,
      id: data.id.toString(),
    };

  } catch (error) {
    console.error('Erro de jumento ao gerar PIX:', error);
    throw error;
  }
}

export async function verificarStatusPagamento(transactionId: string): Promise<string> {
  try {
    const response = await fetch(`${BUCKPAY_API_URL}/${transactionId}`, { // URL DE STATUS CORRETA
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BUCKPAY_TOKEN}`, // PRECISA DO TOKEN AQUI TBM, LERDO
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${response.status}`);
    }

    const data = await response.json();
    return data.status || 'pending';

  } catch (error) {
    console.error('Erro ao verificar se o otário pagou:', error);
    return 'error';
  }
}
