'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50">
                  <Sparkles className="h-4 w-4" />
                  Interactive Learning Platform
                </Badge>
              </motion.div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Master Theory of
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600">
                  {' '}Computation
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                Visualize, simulate, and understand automata through interactive 3D models. 
                Transform abstract concepts into tangible learning experiences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" asChild>
                <a href="/simulator">
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Universities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Success Rate</div>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-orange-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* 3D Automata Visualization Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 relative">
                  {/* State Nodes */}
                  <div className="absolute top-8 left-8 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    q0
                  </div>
                  <div className="absolute top-8 right-8 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    q1
                  </div>
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    q2
                  </div>
                  
                  {/* Transitions */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path
                      d="M 80 80 Q 128 40 176 80"
                      stroke="#f97316"
                      strokeWidth="3"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    <path
                      d="M 176 80 Q 128 120 80 80"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    <path
                      d="M 128 80 L 128 176"
                      stroke="#10b981"
                      strokeWidth="3"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="currentColor"
                        />
                      </marker>
                    </defs>
                  </svg>
                  
                  {/* Labels */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    &apos;a&apos;
                  </div>
                  <div className="absolute top-4 right-1/2 transform translate-x-1/2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    &apos;b&apos;
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    &apos;c&apos;
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-4 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-500"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
