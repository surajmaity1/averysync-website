// import { Footer } from './home-footer'
// import { Navbar } from './home-navbar'

import { Footer } from './components/layout/footer'
import { Navbar } from './components/layout/navbar'
import { CallToAction } from './components/sections/call-to-action'
import { Features } from './components/sections/features'
import { Hero } from './components/sections/hero'
import { Stats } from './components/sections/stats'
import { Testimonials } from './components/sections/testimonials'

// export const HomePage = () => {
//   return (
//     <div className="min-h-screen overflow-hidden bg-white text-black">
//       <Navbar />
//       <Footer />
//     </div>
//   )
// }

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}
