'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Upload } from 'lucide-react'

export default function StudyMaterialsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-poppins font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
          >
            Study Materials
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground font-poppins max-w-3xl mx-auto leading-relaxed"
          >
            Comprehensive learning resources to master the Theory of Computation.
          </motion.p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="container mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Upload className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-poppins font-bold text-foreground mb-6">
            Content Will Be Uploaded Soon
          </h2>
          
          <p className="text-lg text-muted-foreground font-poppins leading-relaxed mb-8">
            We're working hard to create comprehensive study materials including tutorials, exercises, videos, and reference guides. 
            Stay tuned for exciting learning resources that will help you master the Theory of Computation!
          </p>

          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-poppins font-medium">Tutorials</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-poppins font-medium">Exercises</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <span className="font-poppins font-medium">Resources</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
