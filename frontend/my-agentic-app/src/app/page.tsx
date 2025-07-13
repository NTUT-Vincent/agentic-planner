'use client'

import { useState } from 'react'
import Image from "next/image";
import CreatePlanForm from '@/components/CreatePlanForm'
import PlansList from '@/components/PlansList'
import TasksList from '@/components/TasksList'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Dashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTab, setActiveTab] = useState('plans')
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null)

  const planTypes = [
    { id: 'study', name: 'Study Plan', icon: '📖', color: 'bg-mabel-500' },
    { id: 'weight_loss', name: 'Weight Loss', icon: '⚖', color: 'bg-mabel-400' },
    { id: 'financial', name: 'Financial Goal', icon: '$', color: 'bg-mabel-600' },
    { id: 'life_tasks', name: 'Life Tasks', icon: '✓', color: 'bg-mabel-700' },
  ]

  const handleCreatePlan = (planType?: string) => {
    setSelectedPlanType(planType || null)
    setShowCreateForm(true)
  }

  const handleCloseForm = () => {
    setShowCreateForm(false)
    setSelectedPlanType(null)
  }

  const handlePlanTypeChange = (newType: string) => {
    setSelectedPlanType(newType)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-mabel-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Your AI Planning Assistant
              </h1>
              <p className="text-lg text-gray-600">
                Create personalized plans and let AI help you achieve your goals
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white rounded-t-lg">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'plans'
                      ? 'border-mabel-500 text-mabel-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Plans
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tasks'
                      ? 'border-mabel-500 text-mabel-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Tasks
                </button>
              </nav>
            </div>

            {activeTab === 'plans' && (
              <>
                {/* Quick Create Section */}
                <div className="card">
                  <div className="card-header">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Create New Plan</h2>
                      <button
                        onClick={() => handleCreatePlan()}
                        className="btn-primary"
                      >
                        <span className="mr-2">+</span>
                        New Plan
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    {/* Plan Type Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {planTypes.map((type) => (
                        <div
                          key={type.id}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-mabel-300 cursor-pointer transition-colors"
                          onClick={() => handleCreatePlan(type.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${type.color}`}>
                              <span className="text-white text-lg">{type.icon}</span>
                            </div>
                            <span className="font-medium text-gray-700">{type.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Create Form */}
                    {showCreateForm && (
                      <CreatePlanForm 
                        key={selectedPlanType || 'default'}
                        onClose={handleCloseForm}
                        selectedType={selectedPlanType}
                        onTypeChange={handlePlanTypeChange}
                      />
                    )}
                  </div>
                </div>

                {/* Plans List */}
                <PlansList />
              </>
            )}

            {activeTab === 'tasks' && (
              <TasksList />
            )}

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="card-body">
                  <div className="w-12 h-12 bg-mabel-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">AI</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Goal Parsing</h3>
                  <p className="text-gray-600">
                    Describe your goals in natural language and let AI create structured plans
                  </p>
                </div>
              </div>

              <div className="card text-center">
                <div className="card-body">
                  <div className="w-12 h-12 bg-mabel-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Smart Task Breakdown</h3>
                  <p className="text-gray-600">
                    Automatically generate actionable tasks with timelines and milestones
                  </p>
                </div>
              </div>

              <div className="card text-center">
                <div className="card-body">
                  <div className="w-12 h-12 bg-mabel-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">△</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
                  <p className="text-gray-600">
                    Update progress with natural language and get AI-powered insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
