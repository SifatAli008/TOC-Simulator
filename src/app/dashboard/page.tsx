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
  Search,
  X,
  Target
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
    gradient: 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20',
    features: ['Visual parsing', 'Regex to NFA/DFA', 'Pattern matching', 'Syntax highlighting'],
    difficulty: 'Beginner',
    category: 'Regular',
    path: '/simulator?type=regex'
  }
]

const hierarchy = [
  { level: 1, name: 'DFA', description: 'Regular Languages', power: 'Lowest', color: 'blue' },
  { level: 2, name: 'NFA', description: 'Regular Languages', power: 'Low', color: 'orange' },
  { level: 3, name: 'FSM', description: 'Moore/Mealy Machines', power: 'Medium', color: 'green' },
  { level: 4, name: 'PDA', description: 'Context-Free Languages', power: 'High', color: 'orange' },
  { level: 5, name: 'TM', description: 'Recursively Enumerable', power: 'Highest', color: 'orange' }
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
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-top bg-no-repeat transition-transform duration-[20s] hover:scale-105 -translate-y-4"
          style={{ backgroundImage: 'url(/Image/4929571ca9465e280f1fa7e9bd7772aa.gif)' }}
        ></div>
        
        {/* Black Overlay for Content Visibility */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-primary/15 rounded-full blur-lg animate-float" style={{ animationDelay: '4s' }}></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/30 text-white font-poppins font-semibold text-xs mb-4 hover:bg-primary/25 transition-all duration-300 shadow-lg"
            >
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Interactive Theory of Computation Platform
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl lg:text-7xl font-poppins font-black mb-6 leading-tight tracking-tight"
            >
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-white via-orange-300 to-orange-100 bg-clip-text text-transparent bg-300% animate-gradient drop-shadow-2xl filter brightness-110">
                  TOC Simulator
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white via-orange-300 to-orange-100 bg-clip-text text-transparent opacity-50 blur-sm animate-pulse">
                  TOC Simulator
                </span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-100 text-xl lg:text-2xl leading-relaxed mb-6 max-w-4xl mx-auto font-poppins font-light tracking-wide"
            >
              Master the theory of computation through
              <span className="relative inline-block ml-2">
                <span className="bg-gradient-to-r from-orange-300 via-orange-200 to-orange-400 bg-clip-text text-transparent font-bold animate-gradient bg-300% filter brightness-125 drop-shadow-lg">
                  interactive visualization
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-orange-300 via-orange-200 to-orange-400 bg-clip-text text-transparent opacity-30 blur-sm animate-pulse font-bold">
                  interactive visualization
                </span>
              </span>
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-gray-300 text-base lg:text-lg leading-relaxed mb-6 max-w-2xl mx-auto font-poppins font-normal"
            >
              Explore DFA, NFA, PDA, Turing Machines and more with our powerful simulation tools
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
            >
              <Button 
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-primary via-orange-500 to-orange-600 hover:from-orange-500 hover:via-primary hover:to-orange-700 h-14 px-8 text-lg font-poppins font-bold shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 text-white"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Play className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Start Learning
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="group h-14 px-8 text-lg font-poppins font-semibold bg-white/5 backdrop-blur-md border-2 border-gray-200/40 hover:border-orange-300 hover:bg-orange-500/10 text-gray-100 hover:text-orange-200 transition-all duration-300 hover:-translate-y-1"
              >
                <BookOpen className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                View Tutorials
              </Button>
            </motion.div>

            {/* Feature Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {['DFA & NFA', 'Turing Machines', 'Context-Free Grammars', 'Real-time Simulation'].map((feature, index) => (
                <div 
                  key={feature}
                  className="px-4 py-2 bg-white/8 backdrop-blur-sm rounded-full border border-gray-300/30 text-gray-200 text-sm font-poppins font-medium hover:bg-orange-500/15 hover:border-orange-300/60 hover:text-orange-200 transition-all duration-300 cursor-default shadow-lg"
                  style={{ animationDelay: `${1.2 + index * 0.1}s` }}
                >
                  {feature}
              </div>
              ))}
            </motion.div>
              </div>
              </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center text-foreground/60 hover:text-primary transition-colors duration-300 cursor-pointer">
            <span className="text-sm font-medium mb-2">Explore Simulators</span>
            <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center">
              <div className="w-1 h-3 bg-current rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Why TOC Simulator Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-poppins font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Why you need this TOC Simulator
                </h2>
                <p className="text-lg text-muted-foreground font-poppins leading-relaxed mb-6">
                  Traditional textbook learning of Theory of Computation can be abstract and difficult to grasp. Our interactive simulator transforms complex theoretical concepts into visual, hands-on experiences that make learning intuitive and engaging.
                </p>
                <p className="text-muted-foreground font-poppins leading-relaxed mb-6">
                  Whether you're a student struggling with automata theory, an educator looking for better teaching tools, or a researcher exploring computational models, our platform provides the clarity and understanding you need.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground font-poppins font-medium">Visualize abstract concepts instantly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground font-poppins font-medium">Learn through interactive experimentation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-foreground font-poppins font-medium">Master complex topics with ease</span>
                  </div>
            </div>
          </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="font-poppins font-semibold">
                  <Link href="/features">
                    <Play className="h-5 w-5 mr-3" />
                    Start Learning Now
                  </Link>
            </Button>
                <Button size="lg" variant="outline" asChild className="font-poppins font-semibold">
                  <Link href="/study-materials">
                    <BookOpen className="h-5 w-5 mr-3" />
                    Study Materials
                  </Link>
            </Button>
          </div>
        </div>

            {/* Second Image - Properly Used */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-2xl p-8 shadow-xl">
                <img 
                  src="/Image/f0f0d932d6e39c7af5aa305cbd8da735.gif" 
                  alt="Theory of Computation Concepts" 
                  className="w-full h-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
            </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-poppins font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
            >
              Powerful Features
            </motion.h2>
            <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground font-poppins max-w-3xl mx-auto leading-relaxed"
            >
              Discover the comprehensive tools and capabilities that make TOC Simulator the perfect platform for learning computational theory.
            </motion.p>
                          </div>
                          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Interactive Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-lg border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                          </div>
                <h3 className="text-xl font-poppins font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  Interactive Visualization
                </h3>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                  See your automata come to life with real-time visual feedback. Watch state transitions, track input processing, and understand complex algorithms through dynamic animations.
                </p>
                        </div>
            </motion.div>

            {/* Feature 2 - Step-by-Step Execution */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-lg border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-poppins font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  Step-by-Step Execution
                </h3>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                  Debug and understand your automata with detailed step-by-step execution. Pause, rewind, and analyze each transition to master the computational process.
                </p>
                        </div>
            </motion.div>

            {/* Feature 3 - Multiple Automata Types */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-lg border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="h-8 w-8 text-white" />
                          </div>
                <h3 className="text-xl font-poppins font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  Multiple Automata Types
                </h3>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                  Work with DFA, NFA, PDA, Turing Machines, and more. Each simulator is tailored to its specific computational model with unique features and capabilities.
                </p>
                        </div>
            </motion.div>

            {/* Feature 4 - Real-time Validation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-lg border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-poppins font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  Real-time Validation
                </h3>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                  Get instant feedback on your automata design. Our intelligent validation system catches errors and provides helpful suggestions as you build.
                </p>
              </div>
                  </motion.div>

            {/* Feature 5 - Export & Share */}
              <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-lg border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                        </div>
                <h3 className="text-xl font-poppins font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  Export & Share
                              </h3>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                  Save your work and share it with classmates or instructors. Export to various formats and collaborate on complex computational models.
                              </p>
                            </div>
            </motion.div>

            {/* Feature 6 - Educational Resources */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="group relative bg-card/80 backdrop-blur-sm rounded-xl p-8 shadow-sm hover:shadow-lg border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                            </div>
                <h3 className="text-xl font-poppins font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  Educational Resources
                </h3>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                  Access comprehensive tutorials, examples, and learning materials. From basic concepts to advanced topics, we've got you covered.
                </p>
                          </div>
            </motion.div>
                          </div>
                        </div>
                        
        {/* How It Works Section */}
        <div className="mb-20">
          {/* Section kept but content removed */}
        </div>

        {/* Getting Started Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-primary rounded-lg p-8 lg:p-12 text-primary-foreground text-center"
        >
          <h2 className="text-3xl font-poppins font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto font-poppins">
            Join thousands of students and educators who are already using TOC Simulator to master computational theory.
          </p>
          <div className="flex justify-center">
            <Button size="lg" asChild className="bg-background text-foreground hover:bg-muted font-poppins font-semibold">
              <Link href="/features">
              <Play className="h-5 w-5 mr-2" />
                View All Simulators
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}






