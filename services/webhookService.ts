import { Task } from '../types';

// Envia uma tarefa para o webhook do Google Apps Script usando um método GET
// que é mais compatível com contornos de CORS em Web Apps do Google Script.
export const postTaskToSheet = async (
  webhookUrl: string,
  task: Task,
): Promise<{ status: number; body: string }> => {
  const payload: Record<string, any> = {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    tags: task.tags.join(', '),
    timeSpent_seconds: task.timeSpent,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };

  task.customFields.forEach((field) => {
    if (field.key.trim()) {
      payload[`custom_${field.key.trim().replace(/\s+/g, '_')}`] = field.value;
    }
  });

  // Constrói a URL com os parâmetros da tarefa
  const url = new URL(webhookUrl);
  Object.entries(payload).forEach(([key, value]) => {
    // Limita o tamanho da descrição para evitar URLs muito longas
    if (key === 'description' && String(value).length > 500) {
      url.searchParams.append(key, String(value).substring(0, 500) + '...');
    } else {
      url.searchParams.append(key, String(value));
    }
  });

  console.log('[webhook] Enviando tarefa via GET para:', url.toString());

  try {
    // Usa 'no-cors' pois o Google Script não retorna os headers de CORS corretos,
    // mas o GET request com parâmetros na URL geralmente é processado com sucesso.
    await fetch(url.toString(), {
      method: 'GET',
      mode: 'no-cors',
    });

    // Como estamos em modo 'no-cors', não podemos ler a resposta.
    // Assumimos sucesso e retornamos uma mensagem informativa.
    // A verificação final deve ser feita na planilha.
    return { status: 200, body: 'Requisição enviada com sucesso (no-cors). Verifique a planilha.' };
  } catch (error) {
    console.error('[webhook] Falha de rede ao enviar tarefa via GET:', error);
    // Mesmo em 'no-cors', erros de rede (ex: sem conexão) podem ocorrer.
    // Retornamos um status de erro genérico.
    return { status: 500, body: `Falha de rede: ${error}` };
  }
};
