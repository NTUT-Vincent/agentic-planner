'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import TaskCard from '@/components/TaskCard'

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

interface Plan {
  plan_id: string
  title: string
  description: string
  plan_type: 'study' | 'weight_loss' | 'financial' | 'life_tasks'
  completion_rate: number
}

const planTypeIcons = {
  study: '📖',
  weight_loss: '🏃',
  financial: '$',
  life_tasks: '✓'
}

export default function TasksDashboard() {
  const params = useParams()
  const router = useRouter()
  const planId = params.planId as string

  const [plan, setPlan] = useState<Plan | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const [planResponse, tasksResponse] = await Promise.all([
          apiClient.get(`/api/status/${planId}`),
          apiClient.get(`/api/tasks/${planId}`)
        ])
        
        const planData = planResponse.data
        const tasksData = tasksResponse.data
        
        setPlan({
          plan_id: planData.plan_id,
          title: planData.title,
          description: 'Plan details',
          plan_type: 'study',
          completion_rate: planData.completion_rate
        })
        
        setTasks(tasksData)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        // Mock data as fallback
        const mockPlan: Plan = {
          plan_id: planId,
          title: 'IELTS Preparation',
          description: 'Comprehensive study plan for IELTS exam preparation',
          plan_type: 'study',
          completion_rate: 65.5
        }

        const mockTasks: Task[] = [
          {
            id: '1',
            title: 'Complete IELTS Reading Practice',
            description: 'Practice reading comprehension for 1 hour daily',
            target_date: '2024-02-15T00:00:00',
            status: 'in_progress',
            unit: 'pages',
            target_value: 50,
            current_value: 25,
            memo: 'Focusing on academic passages. Need to improve time management.'
          },
          {
            id: '2',
            title: 'Writing Task Practice',
            description: 'Complete 5 writing tasks this week',
            target_date: '2024-02-10T00:00:00',
            status: 'pending',
            unit: 'essays',
            target_value: 5,
            current_value: 0
          },
          {
            id: '3',
            title: 'Vocabulary Building',
            description: 'Learn 20 new words daily',
            target_date: '2024-02-20T00:00:00',
            status: 'completed',
            unit: 'words',
            target_value: 100,
            current_value: 100,
            memo: 'Completed ahead of schedule! Used flashcards and spaced repetition.'
          }
        ]
        
        setPlan(mockPlan)
        setTasks(mockTasks)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [planId])

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    )
  }

  const filteredTasks = tasks.filter(task => 
    filter === 'all' ? true : task.status === filter
  )

  const getTaskStats = () => {
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const pending = tasks.filter(t => t.status === 'pending').length
    return { completed, inProgress, pending, total: tasks.length }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plan not found</h1>
          <button 
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const stats = getTaskStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <span className="mr-2">←</span>
            Back to Plans
          </button>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">
                {planTypeIcons[plan.plan_type]}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
                <p className="text-gray-600 mt-1">{plan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(plan.completion_rate)}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
              <div className="text-blue-500 text-2xl">#</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-green-500 text-2xl">✓</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div className="text-blue-500 text-2xl">→</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-gray-500 text-2xl">○</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Tasks', count: stats.total },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'in_progress', label: 'In Progress', count: stats.inProgress },
                { key: 'completed', label: 'Completed', count: stats.completed },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as typeof filter)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">—</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {filter === 'all' ? '' : filter} tasks found
                </h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'This plan has no tasks yet.' 
                    : `No ${filter.replace('_', ' ')} tasks to show.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
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
      </div>
    </div>
  )
}
