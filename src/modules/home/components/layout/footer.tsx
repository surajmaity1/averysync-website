import { Cpu, Github, Linkedin, Twitter, Youtube } from 'lucide-react'
import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-blue-600 p-1.5">
                <Cpu className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Averysync</span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500">
              The premier platform for technical problem solving and
              professional networking. Built by developers, for developers.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-slate-900">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="./feed" className="hover:text-blue-600">
                  Browse Issues
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Community Feed
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Experts
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Tags
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Partners
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold text-slate-900">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Status
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            © 2025 Averysync Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-900">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-900">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
