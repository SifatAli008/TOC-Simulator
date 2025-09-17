import React from 'react'
import { Github, Twitter, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white font-bold">
                T
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                TOC Simulator
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Interactive web-based tool for learning Theory of Computation through visualization and simulation.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>DFA/NFA Design</li>
              <li>Step-by-Step Simulation</li>
              <li>3D Visualization</li>
              <li>Model Conversion</li>
              <li>Cloud Storage</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <a href="#tutorials" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#documentation" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#api" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@tocsimulator.com"
                className="text-gray-600 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Built with Next.js, Three.js, and Firebase
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © 2024 TOC Simulator. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-300">
              <a href="#privacy" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
