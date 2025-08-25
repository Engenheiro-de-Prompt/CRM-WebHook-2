
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

  console.debug('Enviando tarefa para webhook', { webhookUrl, payload });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Resposta inválida do webhook', response.status, text);
      throw new Error(`Webhook respondeu com status ${response.status}`);
    }

    console.log('Dados da tarefa enviados para o webhook para a tarefa:', task.title);
  } catch (error) {
    console.error('Falha ao enviar a tarefa para o Google Sheet:', error);
    throw error;
  }
};