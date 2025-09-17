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
  BookOpen,
  ChevronRight,
  Grid3X3,
  List,
  Filter,
  Search,
  X
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
    gradient: 'from-blue-50 to-cyan-50',
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
    color: 'from-orange-500 to-orange-600',
    gradient: 'from-orange-50 to-orange-100',
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
    gradient: 'from-green-50 to-emerald-50',
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
    gradient: 'from-orange-50 to-red-50',
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
    color: 'from-orange-600 to-orange-700',
    gradient: 'from-orange-100 to-orange-200',
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
    gradient: 'from-teal-50 to-cyan-50',
    features: ['Visual parsing', 'Regex to NFA/DFA', 'Pattern matching', 'Syntax highlighting'],
    difficulty: 'Beginner',
    category: 'Regular',
    path: '/simulator?type=regex'
  }
]

export default function FeaturesPage() {
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
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Features Header */}
      <div className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-poppins font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Simulators
          </h1>
          <p className="text-xl text-muted-foreground font-poppins max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive collection of interactive automata simulators designed to help you master the theory of computation.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search simulators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Regular">Regular Languages</option>
              <option value="Context-Free">Context-Free Languages</option>
              <option value="Recursive">Recursive Languages</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`transition-all duration-200 ${viewMode === 'grid' ? 'shadow-sm' : 'hover:bg-muted'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`transition-all duration-200 ${viewMode === 'list' ? 'shadow-sm' : 'hover:bg-muted'}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Simulators Grid */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                  <Card className="h-full group cursor-pointer border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/80 backdrop-blur-sm">
                    {/* Enhanced Top Border */}
                    <div className="h-1 bg-gradient-to-r from-primary to-orange-600 group-hover:h-2 transition-all duration-300" />
                    
                    <CardHeader className="relative p-6">
                      <div className="flex items-start justify-between mb-6">
                        {/* Enhanced Icon with Glow */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary to-orange-600 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                            <simulator.icon className="h-7 w-7 text-white" />
                          </div>
                        </div>
                        
                        {/* Enhanced Status Badges */}
                        <div className="flex flex-col items-end space-y-2">
                          {simulator.isNew && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 shadow-sm animate-pulse">
                              ✨ New
                            </Badge>
                          )}
                          {simulator.isPopular && (
                            <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-medium px-3 py-1 shadow-sm">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-3 font-poppins">
                        {simulator.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground leading-relaxed font-poppins">
                        {simulator.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6 p-6 pt-0">
                      {/* Enhanced Meta Information */}
                      <div className="flex items-center justify-between">
                        <Badge className={`${getDifficultyColor(simulator.difficulty)} font-medium px-4 py-2 rounded-lg shadow-sm`}>
                          {simulator.difficulty}
                        </Badge>
                        <Badge variant="outline" className="font-medium px-4 py-2 rounded-lg border-2 hover:border-primary/30 transition-colors">
                          {simulator.category}
                        </Badge>
                      </div>
                      
                      {/* Enhanced Features Section */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground font-poppins uppercase tracking-wide">Key Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {simulator.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors font-poppins">
                              {feature}
                            </Badge>
                          ))}
                          {simulator.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors font-poppins">
                              +{simulator.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced CTA Button */}
                      <Button 
                        asChild 
                        className="w-full h-12 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary font-poppins font-semibold text-base shadow-md hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <Link href={simulator.path}>
                          <Play className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                          Launch Simulator
                          <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
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
                  <Card className="group cursor-pointer border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm">
                    <div className="flex items-center space-x-6 p-8">
                      {/* Enhanced Icon */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary to-orange-600 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                          <simulator.icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Enhanced Content */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 font-poppins">
                              {simulator.name}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed font-poppins text-lg max-w-2xl">
                              {simulator.description}
                            </p>
                          </div>
                          
                          {/* Enhanced Status Badges */}
                          <div className="flex items-center space-x-3">
                            {simulator.isNew && (
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 shadow-sm animate-pulse">
                                ✨ New
                              </Badge>
                            )}
                            {simulator.isPopular && (
                              <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-medium px-3 py-1 shadow-sm">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced Meta Row */}
                        <div className="flex items-center space-x-6">
                          <Badge className={`${getDifficultyColor(simulator.difficulty)} font-medium px-4 py-2 rounded-lg shadow-sm`}>
                            {simulator.difficulty}
                          </Badge>
                          <Badge variant="outline" className="font-medium px-4 py-2 rounded-lg border-2 hover:border-primary/30 transition-colors">
                            {simulator.category}
                          </Badge>
                          <div className="flex space-x-2">
                            {simulator.features.slice(0, 2).map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors font-poppins">
                                {feature}
                              </Badge>
                            ))}
                            {simulator.features.length > 2 && (
                              <Badge variant="secondary" className="text-xs px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors font-poppins">
                                +{simulator.features.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Action Button */}
                      <Button 
                        asChild 
                        className="h-12 px-8 bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary font-poppins font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <Link href={simulator.path}>
                          <Play className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                          Launch
                          <ChevronRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
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
    </div>
  )
}
