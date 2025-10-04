import { Footer } from './home-footer'
import { Navbar } from './home-navbar'

export const HomePage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-black">
      <Navbar />
      <Footer />
    </div>
  )
}
