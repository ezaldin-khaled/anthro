import { MouseProvider } from './contexts/MouseContext'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HeroLogos } from './components/HeroLogos'
import { Services } from './components/Services'
import { OurWork } from './components/OurWork'
import { AboutUs } from './components/AboutUs'
import { ContactUs } from './components/ContactUs'
import { Footer } from './components/Footer'

function App() {
  return (
    <MouseProvider>
      <Header />
      <Hero />
      <HeroLogos />
      <Services />
      <AboutUs />
      <OurWork />
      <ContactUs />
      <Footer />
    </MouseProvider>
  )
}

export default App;
