'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { AxiosError } from 'axios'

const planSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  plan_type: z.enum(['study', 'weight_loss', 'financial', 'life_tasks']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
})

type PlanFormData = z.infer<typeof planSchema>

interface CreatePlanFormProps {
  onClose: () => void
  selectedType?: string | null
  onTypeChange?: (type: string) => void
}

interface ApiErrorResponse {
  detail?: string
  message?: string
}

interface CreatePlanResponse {
  plan_id: string
  tasks_created: number
  status: string
}

const planExamples = {
  study: {
    title: 'IELTS Preparation',
    description: 'Comprehensive study plan to achieve IELTS band 7.5. Focus on reading comprehension, writing skills, listening practice, and speaking fluency. Daily practice sessions with mock tests and vocabulary building.',
    icon: '📚'
  },
  weight_loss: {
    title: 'Weight Loss Journey',
    description: 'Lose 15 pounds in 3 months through balanced diet and regular exercise. Include cardio workouts, strength training, meal planning, and tracking daily calorie intake.',
    icon: '⚖️'
  },
  financial: {
    title: 'Emergency Fund Goal',
    description: 'Build an emergency fund of $10,000 within 12 months. Create a monthly savings plan, reduce unnecessary expenses, and explore additional income sources.',
    icon: '💰'
  },
  life_tasks: {
    title: 'Home Organization Project',
    description: 'Organize and declutter entire home room by room. Sort belongings, donate unused items, create storage systems, and maintain organized spaces.',
    icon: '✅'
  }
}

export default function CreatePlanForm({ onClose, selectedType, onTypeChange }: CreatePlanFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      plan_type: (selectedType as PlanFormData['plan_type']) || 'study',
    }
  })

  const selectedPlanType = watch('plan_type')

  const handlePlanTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    setValue('plan_type', newType as PlanFormData['plan_type'])
    onTypeChange?.(newType)
  }

  const handleUseExample = () => {
    const example = planExamples[selectedPlanType]
    setValue('title', example.title)
    setValue('description', example.description)
  }

  const onSubmit = async (data: PlanFormData): Promise<void> => {
    if (!user) {
      setError('You must be logged in to create a plan')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.post<CreatePlanResponse>('/api/create', {
        ...data,
        user_id: user.id,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      })

      setSuccess(`Plan created successfully! ${response.data.tasks_created} tasks generated.`)
      reset()
      setTimeout(() => {
        setSuccess(null)
        onClose()
      }, 2000)
    } catch (err: unknown) {
      console.error('Failed to create plan:', err)
      
      if (err instanceof AxiosError) {
        const errorData = err.response?.data as ApiErrorResponse
        setError(errorData?.detail || errorData?.message || 'Failed to create plan')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border-t pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Create New Plan</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
          type="button"
        >
          <span className="text-lg">✕</span>
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Type
            </label>
            <select 
              {...register('plan_type')} 
              className="input-field"
              onChange={handlePlanTypeChange}
            >
              <option value="study">📚 Study Plan</option>
              <option value="weight_loss">⚖️ Weight Loss</option>
              <option value="financial">💰 Financial Goal</option>
              <option value="life_tasks">✅ Life Tasks</option>
            </select>
            {errors.plan_type && (
              <p className="text-red-500 text-sm mt-1">{errors.plan_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              {...register('title')}
              className="input-field"
              placeholder={`e.g., ${planExamples[selectedPlanType].title}`}
              type="text"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
        </div>

        {/* Example Card */}
        <div className="bg-mabel-50 border border-mabel-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{planExamples[selectedPlanType].icon}</span>
              <div>
                <h4 className="font-medium text-mabel-900">Example: {planExamples[selectedPlanType].title}</h4>
                <p className="text-sm text-mabel-700">Get started with this example</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseExample}
              className="text-sm bg-mabel-600 text-white px-3 py-1 rounded hover:bg-mabel-700 transition-colors"
            >
              Use Example
            </button>
          </div>
          <p className="text-sm text-mabel-800 leading-relaxed">
            {planExamples[selectedPlanType].description}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="input-field"
            placeholder={`Describe your ${selectedPlanType.replace('_', ' ')} goal in detail. AI will use this to create your personalized plan...`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              {...register('start_date')}
              type="date"
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              {...register('end_date')}
              type="date"
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.end_date && (
              <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading && (
              <div className="inline-block w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
            )}
            {isLoading ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  )
}
