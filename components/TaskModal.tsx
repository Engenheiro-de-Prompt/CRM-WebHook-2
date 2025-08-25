import React, { useState, useContext, useEffect, useRef } from 'react';
import { TaskContext } from '../context/TaskContext';
import { Task, Status, Priority, CustomField } from '../types';
import { STATUSES, PRIORITIES } from '../constants';
import { TrashIcon, PlusIcon, PlayIcon, PauseIcon, StopIcon } from './Icons';

const TaskModal: React.FC = () => {
  const { currentTask, isModalOpen, closeModal, saveTask, deleteTask } = useContext(TaskContext);
  
  const initialTaskState: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
    title: '',
    description: '',
    status: Status.ToDo,
    priority: Priority.Medium,
    tags: [],
    customFields: [],
    timeSpent: 0,
  };

  const [task, setTask] = useState(currentTask || initialTaskState);
  const [tagInput, setTagInput] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentTask) {
      setTask(currentTask);
    } else {
      setTask(initialTaskState);
    }
  }, [currentTask]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setTask(prev => ({ ...prev, timeSpent: prev.timeSpent + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  if (!isModalOpen) return null;

  const handleChange = <T,>(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: keyof T, value: any) => {
    setTask(prev => ({ ...prev, [field]: value } as Task));
  };
  
  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!task.tags.includes(tagInput.trim())) {
        setTask(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTask(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const newCustomFields = [...task.customFields];
    newCustomFields[index] = { ...newCustomFields[index], [field]: value };
    setTask(prev => ({ ...prev, customFields: newCustomFields }));
  };
  
  const addCustomField = () => {
      setTask(prev => ({...prev, customFields: [...prev.customFields, {id: crypto.randomUUID(), key: '', value: ''}]}))
  }
  
  const removeCustomField = (id: string) => {
      setTask(prev => ({...prev, customFields: prev.customFields.filter(f => f.id !== id)}))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (task.title.trim()) {
      await saveTask(task as Task);
    }
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTask(prev => ({...prev, timeSpent: 0}));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={closeModal}>
      <div className="bg-secondary rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <input 
            type="text" 
            placeholder="Título da Tarefa"
            value={task.title}
            onChange={(e) => handleChange(e, 'title', e.target.value)}
            className="w-full bg-primary text-xl font-bold text-text-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
            required
          />
          <textarea 
            placeholder="Descrição da Tarefa"
            value={task.description}
            onChange={(e) => handleChange(e, 'description', e.target.value)}
            className="w-full bg-primary text-text-secondary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none h-24 resize-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <select value={task.status} onChange={(e) => handleChange(e, 'status', e.target.value)} className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Prioridade</label>
                <select value={task.priority} onChange={(e) => handleChange(e, 'priority', e.target.value)} className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {task.tags.map(tag => (
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

          <div>
             <label className="block text-sm font-medium text-text-secondary mb-2">Contador de Tempo</label>
             <div className="bg-primary p-3 rounded-lg flex items-center justify-between border border-border-color">
                <span className="text-2xl font-mono font-semibold">{formatTime(task.timeSpent)}</span>
                <div className="flex items-center space-x-2">
                    <button type="button" onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-2 rounded-full bg-border-color hover:bg-accent transition-colors">
                        {isTimerRunning ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    </button>
                    <button type="button" onClick={handleTimerReset} className="p-2 rounded-full bg-border-color hover:bg-red-500 transition-colors">
                        <StopIcon className="w-5 h-5" />
                    </button>
                </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Campos Personalizados</label>
            <div className="space-y-2">
              {task.customFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input type="text" placeholder="Nome do Campo" value={field.key} onChange={e => handleCustomFieldChange(index, 'key', e.target.value)} className="flex-1 bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none" />
                  <input type="text" placeholder="Valor do Campo" value={field.value} onChange={e => handleCustomFieldChange(index, 'value', e.target.value)} className="flex-1 bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none" />
                  <button type="button" onClick={() => removeCustomField(field.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-full bg-primary hover:bg-border-color"><TrashIcon className="w-5 h-5"/></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCustomField} className="mt-2 flex items-center space-x-2 text-sm text-accent hover:underline">
              <PlusIcon className="w-4 h-4" />
              <span>Adicionar Campo Personalizado</span>
            </button>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border-color">
            <div>
            {currentTask && (
                <button type="button" onClick={() => deleteTask(currentTask.id)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                    Excluir Tarefa
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
