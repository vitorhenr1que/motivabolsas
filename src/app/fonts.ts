import { Inter } from "next/font/google";
import { Oswald } from "next/font/google";
import { Noto_Sans } from "next/font/google";

export const inter = Inter({
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap'
  })

  export const oswald = Oswald({
    weight: ['400', '500', '600', '700'],
    style: ['normal'],
    subsets: ['latin'],
    display: 'swap'
  })

  export const poppins = Noto_Sans({
    weight: ['400',  '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap'
  })