'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Cpu, 
  Play, 
  Eye, 
  RefreshCw, 
  Palette, 
  Shield, 
  BookOpen, 
  Brain, 
  Cloud, 
  BarChart3, 
  Accessibility, 
  Zap
} from 'lucide-react'

const features = [
  {
    icon: Cpu,
    title: 'Automata Design & Simulation',
    description: 'Create and simulate DFA, NFA, Regular Expressions, and Turing Machines with intuitive drag-and-drop interface.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Play,
    title: 'Step-by-Step Execution',
    description: 'Trace input processing step-by-step with pause, play, and rewind controls for better understanding.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Eye,
    title: '3D Visualization',
    description: 'Interactive Three.js powered 3D models with zoom, pan, and customizable diagrams for clarity.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: RefreshCw,
    title: 'Model Conversion',
    description: 'Automatically convert NFA to DFA, Regex to NFA/DFA with step-by-step transformation visualization.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Palette,
    title: 'Customization & Themes',
    description: 'Light/dark modes, modular plugin support, and export in multiple formats (JSON, SVG, PNG).',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Error Detection',
    description: 'Real-time validation, syntax checking, and automated feedback on automata correctness.',
    color: 'from-red-500 to-rose-500'
  },
  {
    icon: BookOpen,
    title: 'Learning Resources',
    description: 'Integrated tutorials, tooltips, quizzes, and example automata libraries for self-learning.',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Brain,
    title: 'AI Assistance',
    description: 'AI-powered suggestions for optimization, automated hints, and natural-language explanations.',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Secure Firebase storage, share projects via links, and multi-user real-time collaboration.',
    color: 'from-sky-500 to-blue-500'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Tracking',
    description: 'Monitor progress, track engagement, and generate reports with Chart.js and Firebase Analytics.',
    color: 'from-violet-500 to-purple-500'
  },
  {
    icon: Accessibility,
    title: 'Accessibility Features',
    description: 'Keyboard shortcuts, screen reader support, high-contrast themes, and mobile-friendly interface.',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    icon: Zap,
    title: 'Scalability',
    description: 'Extendable to Pushdown Automata, Context-Free Grammar simulation, and advanced models.',
    color: 'from-rose-500 to-pink-500'
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Modern Learning
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to master Theory of Computation, from basic concepts to advanced research applications.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group relative h-full hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardHeader className="relative">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4 w-fit`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative">
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-orange-500 to-blue-500 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to Transform Your Learning Experience?
            </h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of students and educators who are already using TOC Simulator to master Theory of Computation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600">
                View Documentation
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
