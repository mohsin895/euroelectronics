'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'


import { FloatingCart } from '@/components/floating-cart'

import { useEffect, useState } from 'react'

import {CategorySlider} from "@/components/category";
import ProductSection from "@/components/products-section";

import {BrandSlider} from "@/components/brands";
import BestSellingProduct from "@/components/best-selling-product";
import {HeroSection} from "@/components/hero-section";




interface Testimonial {
  id: number
  name: string
  title: string
  testimonial: string
}

export default function Home() {


  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)

  useEffect(() => {
    // Fetch categories


    // Fetch testimonials
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => setTestimonials(data.testimonials))
      .catch((err) => console.error('[v0] Failed to fetch testimonials:', err))
  }, [])

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonialIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section with Carousel */}
        <section className="px-4 md:px-6 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
           <HeroSection />


          </div>


        </section>
          <CategorySlider />

        {/* Featured Categories */}
<BestSellingProduct />
          <BrandSlider />
        {/* Featured Products */}
       <ProductSection />


        {/* Testimonials */}
        {/*{testimonials.length > 0 && (*/}
        {/*  <section className="py-12 md:py-16 px-4 md:px-6 bg-white">*/}
        {/*    <div className="max-w-4xl mx-auto">*/}
        {/*      <h2 className="text-3xl font-bold text-center mb-2 text-foreground">*/}
        {/*        What Our Customers Say*/}
        {/*      </h2>*/}
        {/*      <div className="w-12 h-1 bg-primary mx-auto mb-12"></div>*/}

        {/*      <div className="relative">*/}
        {/*        <div className="bg-muted rounded-lg p-8 md:p-12">*/}
        {/*          <p className="text-lg text-foreground mb-6 italic">*/}
        {/*            &quot;{testimonials[currentTestimonialIndex].testimonial}&quot;*/}
        {/*          </p>*/}
        {/*          <div className="flex items-center gap-4">*/}
        {/*            <div className="w-14 h-14 bg-primary/20 rounded-full flex-shrink-0"></div>*/}
        {/*            <div>*/}
        {/*              <p className="font-semibold text-foreground">*/}
        {/*                {testimonials[currentTestimonialIndex].name}*/}
        {/*              </p>*/}
        {/*              <p className="text-sm text-muted-foreground">*/}
        {/*                {testimonials[currentTestimonialIndex].title}*/}
        {/*              </p>*/}
        {/*            </div>*/}
        {/*          </div>*/}
        {/*        </div>*/}

        {/*        /!* Navigation Buttons *!/*/}
        {/*        <div className="flex justify-center gap-4 mt-6">*/}
        {/*          <button*/}
        {/*            onClick={prevTestimonial}*/}
        {/*            className="p-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"*/}
        {/*          >*/}
        {/*            ←*/}
        {/*          </button>*/}
        {/*          <button*/}
        {/*            onClick={nextTestimonial}*/}
        {/*            className="p-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"*/}
        {/*          >*/}
        {/*            →*/}
        {/*          </button>*/}
        {/*        </div>*/}

        {/*        /!* Pagination *!/*/}
        {/*        <div className="flex justify-center gap-2 mt-4">*/}
        {/*          {testimonials.map((_, index) => (*/}
        {/*            <button*/}
        {/*              key={index}*/}
        {/*              onClick={() => setCurrentTestimonialIndex(index)}*/}
        {/*              className={`w-2 h-2 rounded-full transition-colors ${*/}
        {/*                index === currentTestimonialIndex*/}
        {/*                  ? 'bg-primary'*/}
        {/*                  : 'bg-border'*/}
        {/*              }`}*/}
        {/*            />*/}
        {/*          ))}*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </section>*/}
        {/*)}*/}


      </main>
      <Footer />

      {/* Floating Cart Widget */}
      <FloatingCart />
    </>
  )
}
