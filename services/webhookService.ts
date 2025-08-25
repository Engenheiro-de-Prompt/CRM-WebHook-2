
import { Task } from '../types';

const flattenObject = <T extends object,>(obj: T, prefix = ''): Record<string, any> => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    const val = (obj as any)[k];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(acc, flattenObject(val, pre + k));
    } else if (Array.isArray(val)) {
        acc[pre + k] = val.join(', ');
    } else {
      acc[pre + k] = val;
    }
    return acc;
  }, {} as Record<string, any>);
};


export const postTaskToSheet = async (webhookUrl: string, task: Task): Promise<void> => {
    try {
        const flattenedTask: Record<string, any> = {
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

        task.customFields.forEach(field => {
            if(field.key.trim()){
                flattenedTask[`custom_${field.key.trim().replace(/\s+/g, '_')}`] = field.value;
            }
        });

        const response = await fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors', // The Apps Script webhook doesn't handle CORS preflight requests
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flattenedTask),
        });
        
        // no-cors mode means we can't read the response, but we can check if it was sent.
        console.log('Dados da tarefa enviados para o webhook para a tarefa:', task.title);

    } catch (error) {
        console.error('Falha ao enviar a tarefa para o Google Sheet:', error);
        // Optionally, show a toast notification to the user about the failure
    }
};