import React, { useState, useContext, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { TaskContext } from '../context/TaskContext';
import { ITask } from '../types';
import { db } from '../services/db';
import { STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '../constants';
import { TrashIcon } from './Icons';

const TaskModal: React.FC = () => {
  const { currentTask, isModalOpen, closeModal, saveTask, deleteTask } = useContext(TaskContext);
  const folders = useLiveQuery(() => db.folders.toArray(), []);

  const getInitialState = (): Partial<ITask> => {
    if (currentTask) return { ...currentTask };
    return {
      title: '',
      description: '',
      status: 'backlog',
      priority: 'med',
      tags: [],
      folder_id: folders?.[0]?.folder_id || '',
      tracked_total_min: 0,
      scheduled_for: undefined,
    };
  };

  const [task, setTask] = useState<Partial<ITask>>(getInitialState);
  const [tagInput, setTagInput] = useState('');
  const [sessionMinutes, setSessionMinutes] = useState(0);

  useEffect(() => {
    setTask(getInitialState());
    setSessionMinutes(0); // Reset session minutes when modal opens
  }, [currentTask, isModalOpen]);

  if (!isModalOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTags = [...(task.tags || []), tagInput.trim()];
      setTask(prev => ({ ...prev, tags: newTags }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = task.tags?.filter(tag => tag !== tagToRemove);
    setTask(prev => ({ ...prev, tags: newTags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (task.title?.trim()) {
      // Find the folder path from the selected folder_id
      const selectedFolder = folders?.find(f => f.folder_id === task.folder_id);
      const taskToSave = {
        ...task,
        folder_path: selectedFolder?.path || '',
      };
      // This will require modifying the context's saveTask function
      await (saveTask as any)(taskToSave, sessionMinutes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={closeModal}>
      <div className="bg-secondary rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <input
            name="title"
            type="text"
            placeholder="Título da Tarefa"
            value={task.title || ''}
            onChange={handleChange}
            className="w-full bg-primary text-xl font-bold text-text-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
          <textarea
            name="description"
            placeholder="Descrição da Tarefa"
            value={task.description || ''}
            onChange={handleChange}
            className="w-full bg-primary text-text-secondary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none h-24 resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
              <select name="status" value={task.status} onChange={handleChange} className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Prioridade</label>
              <select name="priority" value={task.priority} onChange={handleChange} className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none">
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Pasta</label>
              <select name="folder_id" value={task.folder_id} onChange={handleChange} className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none">
                {folders?.map(f => <option key={f.folder_id} value={f.folder_id}>{f.path}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Agendar para</label>
              <input
                name="scheduled_for"
                type="date"
                value={task.scheduled_for || ''}
                onChange={handleChange}
                className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Adicionar Tempo (min)</label>
              <input
                name="session_minutes"
                type="number"
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {task.tags?.map(tag => (
                <div key={tag} className="flex items-center bg-border-color rounded-full px-3 py-1 text-sm">
                  <span>{tag}</span>
                  <button type="button" onClick={() => handleTagRemove(tag)} className="ml-2 text-text-secondary hover:text-white">&times;</button>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Adicione uma tag e pressione Enter"
              className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border-color">
            <div>
              {currentTask && (
                <button type="button" onClick={() => deleteTask(currentTask.task_id)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                  <TrashIcon className="w-5 h-5"/> Excluir
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={closeModal} className="px-6 py-2 bg-border-color text-text-primary font-semibold rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors">Salvar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
