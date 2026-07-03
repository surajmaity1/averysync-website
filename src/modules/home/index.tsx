import { Footer } from './components/layout/footer'
import { Navbar } from './components/layout/navbar'
import { CallToAction } from './components/sections/call-to-action'
import { Features } from './components/sections/features'
import { Hero } from './components/sections/hero'
import { HowItWorks } from './components/sections/how-it-works'
import { ProductShowcase } from './components/sections/product-showcase'
import { Spaces } from './components/sections/spaces'
import { Stats } from './components/sections/stats'
import { Testimonials } from './components/sections/testimonials'

export const HomePage: React.FC = () => {
  return (
    <div id="top" className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Spaces />
        <HowItWorks />
        <Features />
        <ProductShowcase />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
