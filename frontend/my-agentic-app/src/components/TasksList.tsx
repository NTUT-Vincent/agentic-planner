'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import TaskCard from './TaskCard'

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

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ))
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
            <span className="text-4xl mb-4 block">✓</span>
            <p className="text-gray-500">No tasks yet. Create a plan to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onTaskUpdate={handleTaskUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
