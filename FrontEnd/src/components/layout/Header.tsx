'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="w-full relative animate-fade-in">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div className="absolute inset-0 border-b border-white/20"></div>
        <div className="container mx-auto flex h-20 items-center justify-between px-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-orange-600 text-white font-poppins font-black text-xl">
              T
            </div>
            <span className="text-2xl font-poppins font-bold text-white">
              TOC Simulator
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
            <a href="/dashboard" className="text-white/90 px-6 py-3 font-poppins font-medium text-lg">Home</a>
            <a href="#features" className="text-white/90 px-6 py-3 font-poppins font-medium text-lg">Simulators</a>
            <a href="#tutorials" className="text-white/90 px-6 py-3 font-poppins font-medium text-lg">Tutorials</a>
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="lg" className="h-12 px-6 border-2 border-white/50 bg-transparent text-white">
              Sign In
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-primary via-orange-500 to-orange-600 h-12 px-8">
              Get Started
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="w-full relative animate-fade-in">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: 'url(/Image/4929571ca9465e280f1fa7e9bd7772aa.gif)' }}
      ></div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="absolute inset-0 border-b border-white/20"></div>
      <div className="container mx-auto flex h-20 items-center justify-between px-8 relative z-10">
        {/* Logo */}
        <div className="flex items-center space-x-4 interactive group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-orange-500 to-orange-600 text-white font-poppins font-black text-xl shadow-lg hover:shadow-orange-500/30 transition-all duration-300 hover:scale-110 group-hover:rotate-3">
            T
          </div>
          <span className="text-2xl font-poppins font-bold text-white">
            TOC Simulator
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <a href="/dashboard" className="relative text-white/90 hover:text-white transition-all duration-300 group px-6 py-3 rounded-xl hover:bg-primary/10 font-poppins font-medium text-lg">
            Home
            <span className="absolute -bottom-1 left-1/2 w-0 h-1 bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-300 group-hover:w-8 transform -translate-x-1/2"></span>
          </a>
          <a href="/features" className="relative text-white/90 hover:text-white transition-all duration-300 group px-6 py-3 rounded-xl hover:bg-primary/10 font-poppins font-medium text-lg">
            Simulators
            <span className="absolute -bottom-1 left-1/2 w-0 h-1 bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-300 group-hover:w-8 transform -translate-x-1/2"></span>
          </a>
          <a href="/study-materials" className="relative text-white/90 hover:text-white transition-all duration-300 group px-6 py-3 rounded-xl hover:bg-primary/10 font-poppins font-medium text-lg">
            Study Materials
            <span className="absolute -bottom-1 left-1/2 w-0 h-1 bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-300 group-hover:w-8 transform -translate-x-1/2"></span>
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="lg" className="hover-scale font-poppins font-semibold h-12 px-6 border-2 border-white/50 bg-transparent hover:border-primary hover:bg-primary/10 text-white hover:text-primary">
            Sign In
          </Button>
          <Button size="lg" className="hover-glow bg-gradient-to-r from-primary via-orange-500 to-orange-600 hover:from-orange-500 hover:via-primary hover:to-orange-700 font-poppins font-bold h-12 px-8 shadow-lg hover:shadow-orange-500/30">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="h-12 w-12 hover:bg-primary/10 rounded-xl"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden relative animate-slide-in-up">
          {/* Mobile Menu Background */}
          <div 
            className="absolute inset-0 bg-cover bg-top bg-no-repeat"
            style={{ backgroundImage: 'url(/Image/4929571ca9465e280f1fa7e9bd7772aa.gif)' }}
          ></div>
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>
          <div className="absolute inset-0 border-t border-white/20"></div>
          <div className="container mx-auto px-8 py-10 space-y-8 relative z-10">
            <a href="/dashboard" className="block text-white/90 hover:text-white transition-all duration-300 py-4 px-6 rounded-xl hover:bg-primary/10 interactive font-poppins font-medium text-xl">
              Home
            </a>
            <a href="/features" className="block text-white/90 hover:text-white transition-all duration-300 py-4 px-6 rounded-xl hover:bg-primary/10 interactive font-poppins font-medium text-xl">
              Simulators
            </a>
            <a href="/study-materials" className="block text-white/90 hover:text-white transition-all duration-300 py-4 px-6 rounded-xl hover:bg-primary/10 interactive font-poppins font-medium text-xl">
              Study Materials
            </a>
            <div className="pt-8 space-y-6 border-t border-white/20">
              <Button variant="outline" size="lg" className="w-full h-14 hover-scale font-poppins font-semibold text-lg border-2 border-white/50 bg-transparent text-white hover:border-primary hover:bg-primary/10 hover:text-primary">
                Sign In
              </Button>
              <Button size="lg" className="w-full h-14 hover-glow bg-gradient-to-r from-primary via-orange-500 to-orange-600 font-poppins font-bold text-lg shadow-lg">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
