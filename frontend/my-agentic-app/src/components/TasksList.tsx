'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

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

export default function TasksList() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [progressInput, setProgressInput] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const response = await apiClient.get(`/api/tasks/user/${user.id}`)
        setTasks(response.data || [])
      } catch (error) {
        console.error('Failed to fetch user tasks:', error)
        setTasks([])
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [user])

  const handleAIProgressUpdate = async (taskId: string) => {
    if (!progressInput.trim() || !user) return

    setIsUpdating(true)
    try {
      const response = await apiClient.post('/api/progress/ai-update', {
        task_id: taskId,
        user_id: user.id,
        user_input: progressInput
      })

      if (response.data.status === 'success' && response.data.task_updated) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                current_value: response.data.analysis?.new_value || task.current_value,
                status: response.data.analysis?.new_status || task.status
              }
            : task
        ))
        
        setProgressInput('')
        setSelectedTask(null)
      } else {
        console.error('AI update failed:', response.data.error)
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      case 'skipped': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressPercentage = (current: number = 0, target: number = 1) => {
    return Math.min((current / target) * 100, 100)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Tasks</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Tasks</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">✅</span>
            <p className="text-gray-500">No tasks yet. Create a plan to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const progressPercentage = getProgressPercentage(task.current_value, task.target_value)
              
              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      {task.memo && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <span className="text-gray-400">📝 </span>
                          {task.memo}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400">🎯</span>
                        <span className="text-gray-600">
                          {task.current_value || 0} / {task.target_value || 0} {task.unit || ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400">⏰</span>
                        <span className="text-gray-600">
                          Due: {new Date(task.target_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-500">{Math.round(progressPercentage)}%</span>
                  </div>

                  <div className="progress-bar mb-4">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <span className="mr-1">💬</span>
                      Update Progress
                    </button>
                  </div>

                  {selectedTask === task.id && (
                    <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={progressInput}
                          onChange={(e) => setProgressInput(e.target.value)}
                          placeholder="Describe your progress... (e.g., 'I completed 10 pages today')"
                          className="flex-1 input-field"
                        />
                        <button
                          onClick={() => handleAIProgressUpdate(task.id)}
                          disabled={isUpdating || !progressInput.trim()}
                          className="btn-primary"
                        >
                          {isUpdating ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <span>📤</span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Use natural language to describe your progress. AI will automatically update your task.
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
