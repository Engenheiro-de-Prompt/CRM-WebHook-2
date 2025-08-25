
import { Task } from '../types';

// Envia uma tarefa para o webhook do Google Apps Script e registra logs detalhados
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

  // Logs para diagnóstico detalhado
  console.log('[webhook] preparando envio', { webhookUrl, payload });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log('[webhook] resposta recebida', {
      status: response.status,
      body: text,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${text}`);
    }

    return { status: response.status, body: text };
  } catch (error) {
    console.error('[webhook] falha de rede ao enviar tarefa', error);
    console.log('[webhook] tentando fallback no-cors com form-urlencoded');
    try {
      const formBody = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        formBody.append(key, String(value));
      });

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });
      return { status: 0, body: 'no-cors fallback: resposta indisponível' };
    } catch (fallbackError) {
      console.error('[webhook] falha no fallback no-cors', fallbackError);
      throw fallbackError;
    }
  }
};

