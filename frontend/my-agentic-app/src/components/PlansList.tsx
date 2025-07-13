'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface Plan {
  plan_id: string
  title: string
  description: string
  plan_type: 'study' | 'weight_loss' | 'financial' | 'life_tasks'
  completion_rate: number
  start_date: string
  end_date: string
  tasks_count: number
  created_at: string
}

const planTypeConfig = {
  study: { icon: '📖', color: 'bg-mabel-100 text-mabel-800', name: 'Study Plan' },
  weight_loss: { icon: '⚖', color: 'bg-green-100 text-green-800', name: 'Weight Loss' },
  financial: { icon: '$', color: 'bg-yellow-100 text-yellow-800', name: 'Financial Goal' },
  life_tasks: { icon: '✓', color: 'bg-purple-100 text-purple-800', name: 'Life Tasks' }
}

export default function PlansList() {
  const { user } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const response = await apiClient.get(`/api/plans/user/${user.id}`)
        setPlans(response.data || [])
      } catch (error) {
        console.error('Failed to fetch plans:', error)
        // Mock data for demo
        setPlans([
          {
            plan_id: 'plan1',
            title: 'IELTS Preparation',
            description: 'Comprehensive study plan for IELTS exam',
            plan_type: 'study',
            completion_rate: 65.5,
            start_date: '2024-01-01',
            end_date: '2024-04-01',
            tasks_count: 12,
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            plan_id: 'plan2',
            title: 'Weight Loss Journey',
            description: 'Lose 15 pounds in 3 months',
            plan_type: 'weight_loss',
            completion_rate: 40.2,
            start_date: '2024-02-01',
            end_date: '2024-05-01',
            tasks_count: 8,
            created_at: '2024-02-01T00:00:00Z'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [user])

  const handleViewPlan = (planId: string) => {
    router.push(`/plans/${planId}/tasks`)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Plans</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">My Plans</h2>
      
      {plans.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">□</span>
          <p className="text-gray-500">No plans yet. Create your first plan to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const config = planTypeConfig[plan.plan_type]
            
            return (
              <div key={plan.plan_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{config.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{plan.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color} mt-1`}>
                        {config.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-mabel-600">
                      {Math.round(plan.completion_rate)}%
                    </div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>— {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}</span>
                  <span>• {plan.tasks_count} tasks</span>
                </div>
                
                <div className="progress-bar mb-3">
                  <div
                    className="progress-fill"
                    style={{ width: `${plan.completion_rate}%` }}
                  ></div>
                </div>
                
                <button
                  onClick={() => handleViewPlan(plan.plan_id)}
                  className="w-full btn-primary text-center"
                >
                  View Tasks
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
