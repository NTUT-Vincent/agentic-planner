'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Toast from './Toast'

interface Task {
  id: string
  title: string
  description: string
  target_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  unit: string
  target_value: number
  current_value: number
  memo?: string
}

interface TaskCardProps {
  task: Task
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '⏳'
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-mabel-100 text-mabel-800 border-mabel-200',
    icon: '🔄'
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅'
  },
  skipped: { 
    label: 'Skipped', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏭️'
  }
}

export default function TaskCard({ task, onTaskUpdate }: TaskCardProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editingProgress, setEditingProgress] = useState(task.current_value)
  const [editingMemo, setEditingMemo] = useState(task.memo || '')
  const [isAIUpdating, setIsAIUpdating] = useState(false)
  const [aiInputVisible, setAiInputVisible] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [aiResponseNote, setAiResponseNote] = useState<string | null>(null)
  const [showAiNote, setShowAiNote] = useState(false)

  const progressPercentage = Math.min((task.current_value / task.target_value) * 100, 100)
  const isOverdue = new Date(task.target_date) < new Date() && task.status !== 'completed'

  const handleStatusChange = async (newStatus: Task['status']) => {
    const updates: Partial<Task> = { status: newStatus }
    
    if (newStatus === 'completed') {
      updates.current_value = task.target_value
      setEditingProgress(task.target_value)
    }
    
    setIsUpdating(true)
    try {
      const response = await apiClient.patch(`/api/tasks/${task.id}`, {
        status: newStatus,
        current_value: updates.current_value
      })
      
      if (response.data) {
        onTaskUpdate(task.id, {
          status: response.data.status,
          current_value: response.data.current_value
        })
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
      onTaskUpdate(task.id, updates)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProgressSave = async () => {
    const updates: Partial<Task> = {
      current_value: editingProgress,
      memo: editingMemo
    }
    
    if (editingProgress >= task.target_value) {
      updates.status = 'completed'
    } else if (editingProgress > 0 && task.status === 'pending') {
      updates.status = 'in_progress'
    }
    
    setIsUpdating(true)
    try {
      const response = await apiClient.patch(`/api/tasks/${task.id}`, {
        status: updates.status,
        current_value: updates.current_value,
        memo: updates.memo
      })
      
      if (response.data) {
        onTaskUpdate(task.id, {
          status: response.data.status,
          current_value: response.data.current_value,
          memo: response.data.memo
        })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      onTaskUpdate(task.id, updates)
      setIsEditing(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProgressCancel = () => {
    setEditingProgress(task.current_value)
    setEditingMemo(task.memo || '')
    setIsEditing(false)
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditingProgress(task.current_value)
      setEditingMemo(task.memo || '')
    }
    setIsEditing(!isEditing)
  }

  const handleAIUpdate = async () => {
    if (!aiInput.trim() || !user) return

    setIsAIUpdating(true)
    try {
      const response = await apiClient.post('/api/progress/ai-update', {
        task_id: task.id,
        user_id: user.id,
        user_input: aiInput
      })

      if (response.data.status === 'success' && response.data.task_updated) {
        const updates: Partial<Task> = {
          current_value: response.data.analysis?.new_value || task.current_value,
          status: response.data.analysis?.new_status || task.status
        }
        
        if (response.data.analysis?.note) {
          setAiResponseNote(response.data.analysis.note)
          setShowAiNote(true)
        }
        
        onTaskUpdate(task.id, updates)
        setAiInput('')
        setAiInputVisible(false)
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    } finally {
      setIsAIUpdating(false)
    }
  }

  return (
    <div className={`bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
      isEditing ? 'border-mabel-300 ring-2 ring-mabel-100' : 'border-gray-200'
    } ${isUpdating ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{task.description}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[task.status].color}`}>
              <span className="mr-1">{statusConfig[task.status].icon}</span>
              {statusConfig[task.status].label}
            </span>
            
            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {isOverdue && '⚠️ '}
              Due: {format(new Date(task.target_date), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAiInputVisible(!aiInputVisible)}
            disabled={isAIUpdating || isUpdating}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isAIUpdating || isUpdating
                ? 'text-purple-400 bg-purple-50 cursor-not-allowed' 
                : aiInputVisible
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
            }`}
            title="AI Progress Update"
          >
            {isAIUpdating ? <span className="animate-spin">🔄</span> : '🤖'}
          </button>
          
          <button
            onClick={handleEditToggle}
            disabled={isUpdating}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isEditing 
                ? 'text-mabel-600 bg-mabel-50 hover:bg-mabel-100' 
                : 'text-gray-400 hover:text-mabel-600 hover:bg-mabel-50'
            } ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
            title={isEditing ? 'Cancel editing' : 'Edit progress'}
          >
            {isEditing ? '✕' : '✏️'}
          </button>
          
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-mabel-500"
            disabled={isEditing || isAIUpdating || isUpdating}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      {/* AI Progress Update Input */}
      {aiInputVisible && (
        <div className="mb-4 p-3 border border-purple-200 rounded-lg bg-purple-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Describe your progress... (e.g., 'I completed 10 pages today')"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              disabled={isAIUpdating}
            />
            <button
              onClick={handleAIUpdate}
              disabled={isAIUpdating || !aiInput.trim()}
              className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAIUpdating ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                '📤'
              )}
            </button>
          </div>
          <p className="text-xs text-purple-600 mt-2">
            Use natural language to describe your progress. AI will automatically update your task.
          </p>
        </div>
      )}

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          {!isEditing ? (
            <span className="text-sm text-gray-500">
              {task.current_value} / {task.target_value} {task.unit}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={task.target_value}
                value={editingProgress}
                onChange={(e) => setEditingProgress(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 w-16 text-sm focus:outline-none focus:ring-2 focus:ring-mabel-500"
              />
              <span className="text-sm text-gray-500">/ {task.target_value} {task.unit}</span>
            </div>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-300 ${
              task.status === 'completed' ? 'bg-green-500' : 
              task.status === 'in_progress' ? 'bg-mabel-500' : 
              'bg-gray-400'
            }`}
            style={{ width: `${isEditing ? Math.min((editingProgress / task.target_value) * 100, 100) : progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">0</span>
          <span className="text-xs font-medium text-gray-700">
            {Math.round(isEditing ? Math.min((editingProgress / task.target_value) * 100, 100) : progressPercentage)}%
          </span>
          <span className="text-xs text-gray-500">{task.target_value}</span>
        </div>
      </div>

      {/* Memo Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes {isAIUpdating && <span className="text-purple-600 text-xs">(AI is analyzing...)</span>}
        </label>
        {!isEditing ? (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-3 border min-h-[60px]">
            {task.memo || (
              <span className="text-gray-400 italic">No notes yet. Click edit to add notes or use AI updates.</span>
            )}
          </div>
        ) : (
          <textarea
            value={editingMemo}
            onChange={(e) => setEditingMemo(e.target.value)}
            placeholder="Add notes about your progress, challenges, or achievements..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mabel-500 text-sm min-h-[80px] resize-none"
            rows={3}
            disabled={isAIUpdating}
          />
        )}
      </div>

      {/* AI Response Toast */}
      <Toast
        message={aiResponseNote || ''}
        type="ai"
        title="AI Analysis Complete"
        isVisible={showAiNote && !!aiResponseNote}
        onClose={() => setShowAiNote(false)}
        autoHideDuration={5000}
        position="top"
      />

      {/* Edit Mode Actions */}
      {isEditing && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {editingProgress >= task.target_value ? (
                <span className="text-green-600 font-medium">✅ Task will be marked as completed</span>
              ) : editingProgress > 0 && task.status === 'pending' ? (
                <span className="text-mabel-600 font-medium">🔄 Task will be marked as in progress</span>
              ) : (
                <span>Update your progress and notes</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleProgressSave}
                disabled={isUpdating}
                className="px-4 py-2 bg-mabel-600 text-white rounded-md hover:bg-mabel-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={handleProgressCancel}
                disabled={isUpdating}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
