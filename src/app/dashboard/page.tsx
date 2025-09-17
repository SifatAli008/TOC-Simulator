'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Cpu, 
  Brain, 
  Zap, 
  Layers, 
  ArrowRight, 
  Star,
  TrendingUp,
  Users,
  BookOpen,
  ChevronRight,
  Grid3X3,
  List,
  Filter,
  Search
} from 'lucide-react'
import Link from 'next/link'

interface SimulatorCard {
  id: string
  name: string
  type: string
  description: string
  icon: React.ComponentType<any>
  color: string
  gradient: string
  features: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: 'Regular' | 'Context-Free' | 'Recursive'
  path: string
  isNew?: boolean
  isPopular?: boolean
}

const simulators: SimulatorCard[] = [
  {
    id: 'dfa',
    name: 'DFA Simulator',
    type: 'DFA',
    description: 'Deterministic Finite Automaton simulator for creating and testing finite state machines with clear, predictable transitions.',
    icon: Cpu,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    features: ['Step-by-step execution', 'Visual state highlighting', 'Input validation', 'Export/Import'],
    difficulty: 'Beginner',
    category: 'Regular',
    path: '/simulator?type=dfa',
    isPopular: true
  },
  {
    id: 'nfa',
    name: 'NFA Simulator',
    type: 'NFA',
    description: 'Non-deterministic Finite Automaton simulator with support for epsilon transitions and multiple paths.',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    features: ['Epsilon transitions', 'Multiple paths', 'NFA to DFA conversion', '3D visualization'],
    difficulty: 'Intermediate',
    category: 'Regular',
    path: '/simulator?type=nfa',
    isNew: true
  },
  {
    id: 'fsm',
    name: 'Moore/Mealy Machine',
    type: 'FSM',
    description: 'Finite State Machine simulator for creating Moore and Mealy machines with output generation.',
    icon: Layers,
    color: 'from-green-500 to-emerald-500',
    gradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    features: ['Output generation', 'Moore/Mealy modes', 'State minimization', 'Timing diagrams'],
    difficulty: 'Intermediate',
    category: 'Regular',
    path: '/simulator?type=fsm'
  },
  {
    id: 'pda',
    name: 'PDA Simulator',
    type: 'PDA',
    description: 'Pushdown Automaton simulator with stack operations for context-free language recognition.',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    gradient: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    features: ['Stack visualization', 'Context-free languages', 'Grammar conversion', 'Parse trees'],
    difficulty: 'Advanced',
    category: 'Context-Free',
    path: '/simulator?type=pda'
  },
  {
    id: 'tm',
    name: 'Turing Machine',
    type: 'TM',
    description: 'Turing Machine simulator with tape manipulation for the most powerful computation model.',
    icon: Cpu,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
    features: ['Tape visualization', 'Infinite tape', 'Universal computation', 'Halting problem'],
    difficulty: 'Advanced',
    category: 'Recursive',
    path: '/simulator?type=tm'
  },
  {
    id: 'regex',
    name: 'Regex Simulator',
    type: 'REGEX',
    description: 'Regular Expression simulator with visual parsing and automata conversion capabilities.',
    icon: BookOpen,
    color: 'from-teal-500 to-cyan-500',
    gradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
    features: ['Visual parsing', 'Regex to NFA/DFA', 'Pattern matching', 'Syntax highlighting'],
    difficulty: 'Beginner',
    category: 'Regular',
    path: '/simulator?type=regex'
  }
]

const hierarchy = [
  { level: 1, name: 'DFA', description: 'Regular Languages', power: 'Lowest', color: 'blue' },
  { level: 2, name: 'NFA', description: 'Regular Languages', power: 'Low', color: 'purple' },
  { level: 3, name: 'FSM', description: 'Moore/Mealy Machines', power: 'Medium', color: 'green' },
  { level: 4, name: 'PDA', description: 'Context-Free Languages', power: 'High', color: 'orange' },
  { level: 5, name: 'TM', description: 'Recursively Enumerable', power: 'Highest', color: 'indigo' }
]

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filter, setFilter] = useState<'all' | 'Regular' | 'Context-Free' | 'Recursive'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSimulators = simulators.filter(sim => {
    const matchesFilter = filter === 'all' || sim.category === filter
    const matchesSearch = sim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sim.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Automata Simulators
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Explore powerful simulation tools for various types of automata
              </p>
            </div>
            
            {/* Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">6</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Simulators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Universities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search simulators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Regular">Regular Languages</option>
              <option value="Context-Free">Context-Free Languages</option>
              <option value="Recursive">Recursive Languages</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Computational Models Hierarchy */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Computational Models Hierarchy
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {hierarchy.map((model, index) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${
                    model.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                    model.color === 'purple' ? 'from-purple-500 to-pink-500' :
                    model.color === 'green' ? 'from-green-500 to-emerald-500' :
                    model.color === 'orange' ? 'from-orange-500 to-red-500' :
                    'from-indigo-500 to-purple-500'
                  } flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg`}>
                    {model.name}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{model.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{model.description}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {model.power} Power
                  </Badge>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Increasing expressive power →</span>
            </div>
          </div>
        </div>

        {/* Simulators Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Explore Simulators
            </h2>
            <Badge variant="secondary" className="text-sm">
              {filteredSimulators.length} simulators
            </Badge>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredSimulators.map((simulator, index) => (
                  <motion.div
                    key={simulator.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${simulator.color}`} />
                      
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${simulator.color} mb-4`}>
                            <simulator.icon className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex flex-col items-end space-y-1">
                            {simulator.isNew && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                New
                              </Badge>
                            )}
                            {simulator.isPopular && (
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <CardTitle className="group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {simulator.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          {simulator.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className={getDifficultyColor(simulator.difficulty)}>
                            {simulator.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {simulator.category}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Features:</h4>
                          <div className="flex flex-wrap gap-1">
                            {simulator.features.slice(0, 3).map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {simulator.features.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{simulator.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button 
                          asChild 
                          className="w-full group-hover:bg-orange-600 group-hover:border-orange-600 transition-colors"
                        >
                          <Link href={simulator.path}>
                            <Play className="h-4 w-4 mr-2" />
                            Open Simulator
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredSimulators.map((simulator, index) => (
                  <motion.div
                    key={simulator.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-4 p-6">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${simulator.color}`}>
                          <simulator.icon className="h-6 w-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {simulator.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {simulator.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {simulator.isNew && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                  New
                                </Badge>
                              )}
                              {simulator.isPopular && (
                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge className={getDifficultyColor(simulator.difficulty)}>
                              {simulator.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {simulator.category}
                            </Badge>
                            <div className="flex space-x-1">
                              {simulator.features.slice(0, 3).map((feature, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <Button asChild>
                          <Link href={simulator.path}>
                            <Play className="h-4 w-4 mr-2" />
                            Open
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl p-8 lg:p-12 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Choose any simulator above to begin exploring the fascinating world of automata theory and computational models.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
              <Play className="h-5 w-5 mr-2" />
              Start with DFA
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600">
              <BookOpen className="h-5 w-5 mr-2" />
              View Tutorials
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}





