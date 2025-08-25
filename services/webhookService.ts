import { IWebhookEvent } from '../types';

/**
 * Posts an event to the specified webhook URL.
 * Follows the append-only contract defined in the product specification.
 *
 * @param webhookUrl The URL of the Google Apps Script webhook.
 * @param event The event object to send.
 * @returns A promise that resolves to the fetch response.
 */
export const postEventToWebhook = async (
  webhookUrl: string,
  event: IWebhookEvent
): Promise<{ status: number; body: string }> => {

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    // Early exit if the browser reports being offline.
    // This helps prevent unnecessary failed network requests.
    return Promise.reject(new Error('Offline: Não foi possível enviar o evento.'));
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
      // Use 'cors' mode as the spec implies a properly configured endpoint.
      mode: 'cors',
    });

    const responseBody = await response.text();

    if (!response.ok) {
      // The server responded with an error status (4xx or 5xx)
      throw new Error(`Server error: ${response.status} ${response.statusText} - ${responseBody}`);
    }

    return { status: response.status, body: responseBody };

  } catch (error) {
    console.error('[webhookService] Failed to post event:', error);
    if (error instanceof Error) {
      return Promise.reject(new Error(`Network or CORS error: ${error.message}`));
    }
    return Promise.reject(new Error('An unknown error occurred during the webhook call.'));
  }
};
