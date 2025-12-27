import { createContext, useContext, useRef } from 'react'
import gsap from 'gsap'

const AnimationContext = createContext({})

export const useAnimation = () => useContext(AnimationContext)

export const AnimationProvider = ({ children }) => {
  const containerRef = useRef(null)

  const animatePageEnter = (element) => {
    if (!element) return
    gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
  }

  const animateFadeIn = (element) => {
    if (!element) return
    gsap.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    )
  }

  const animateStagger = (elements, stagger = 0.1) => {
    if (!elements || elements.length === 0) return
    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger, ease: 'power2.out' }
    )
  }

  const animateSuccess = (element) => {
    if (!element) return
    gsap.fromTo(
      element,
      { scale: 0.8 },
      { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
    )
  }

  const value = {
    containerRef,
    animatePageEnter,
    animateFadeIn,
    animateStagger,
    animateSuccess,
  }

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  )
}

// Create a simpler hook for components
export const useGSAP = () => {
  const context = useContext(AnimationContext)
  if (!context) {
    return {
      containerRef: { current: null },
      animatePageEnter: () => {},
      animateFadeIn: () => {},
      animateStagger: () => {},
      animateSuccess: () => {},
    }
  }
  return context
}