import { PixResponse } from '../types';

// O endereço do nosso backend. É só pra cá que a gente vai ligar agora.
const BACKEND_URL = 'http://localhost:3001/api';

export interface PixResponse {
  id: string;
  pixCode: string;
  pixQrCode: string;
}

// A SECRET_KEY FOI PRO INFERNO! ELA MORA NO BACKEND AGORA!

export async function gerarPix(
  nome: string,
  email: string,
  cpf: string,
  telefone: string,
  valorCentavos: number,
  descricao: string,
  utmQuery: string
): Promise<PixResponse> {
  
  // A CHAMADA AGORA É PARA O NOSSO BACKEND!
  const response = await fetch(`${BACKEND_URL}/gerar-pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // NÃO PRECISA MAIS DE AUTHORIZATION AQUI, SEU ANIMAL!
      },
    body: JSON.stringify({
      name: nome,
      email,
      cpf,
      phone: telefone,
      paymentMethod: "PIX",
      amount: valorCentavos,
      traceable: true,
      utmQuery,
      items: [
        {
          unitPrice: valorCentavos,
          title: descricao,
          quantity: 1,
          tangible: false
        }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erro ao gerar cobrança:", data);
    throw new Error(data.message || "Erro ao gerar cobrança Pix");
  }

  return {
    id: data.id,
    pixCode: data.pixCode,
    pixQrCode: data.pixQrCode
  };
}

/**
 * Verifica o status de pagamento Pix
 */
// O STATUS_URL ANTIGO FOI PRO LIXO!

export async function verificarStatusPagamento(id: string): Promise<"PENDING" | "APPROVED" | "FAILED" | "REJECTED" | "paid" | "completed" | "cancelled"> {
  // A CHAMADA AGORA É LIMPA E DIRETA PARA O NOSSO BACKEND!
  const response = await fetch(`${BACKEND_URL}/verificar-status/${id}`, {
    method: "GET",
    // SEM HEADER, SEM CHAVE, SEM FRESCURA!
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erro ao verificar status:", data);
    throw new Error(data.message || "Erro ao verificar status do pagamento");
  }

  return data.status;
}
