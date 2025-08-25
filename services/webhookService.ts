
import { Task } from '../types';

// Envia uma tarefa para o webhook do Google Apps Script e registra logs detalhados
export const postTaskToSheet = async (
  webhookUrl: string,
  task: Task,
): Promise<void> => {
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

  // Logs para diagnóstico detalhado
  console.log('[webhook] preparando envio', { webhookUrl, payload });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      // Alguns webhooks (como Google Apps Script) podem bloquear requisições CORS; o modo
      // 'no-cors' permite que a requisição seja despachada mesmo sem cabeçalhos CORS.
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Mesmo no modo 'no-cors' registramos o objeto de resposta para investigação.
    console.log('[webhook] requisição despachada', {
      type: response.type,
      status: response.status,
    });
  } catch (error) {
    console.error('[webhook] falha de rede ao enviar tarefa', error);
    throw error;
  }
};