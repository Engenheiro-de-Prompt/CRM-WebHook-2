import axios from 'axios';
import { CategorizedTasks } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Fetches categorized tasks from the backend API.
 * @returns A promise that resolves to an object containing arrays of tasks for today, overdue, and upcoming.
 */
export const fetchTasks = async (): Promise<CategorizedTasks> => {
  try {
    const response = await axios.get<CategorizedTasks>(`${API_BASE_URL}/tasks`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Log the detailed error message from the backend if it exists
      const errorMessage = error.response?.data?.error || error.message;
      console.error('Error fetching tasks:', errorMessage);
      // Propagate a more user-friendly error message
      throw new Error(`Failed to load tasks: ${errorMessage}`);
    } else {
      // Handle non-Axios errors
      console.error('An unexpected error occurred:', error);
      throw new Error('An unexpected error occurred while fetching tasks.');
    }
  }
};
