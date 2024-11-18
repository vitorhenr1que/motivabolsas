// import * as prismic from '@prismicio/client'

//   export const getClient = () => {
//     const client = prismic.createClient('bolsafacil-ba', {
//         accessToken: process.env.PRISMIC_ACCESS_TOKEN
//     })
//     return client
// }

import * as prismic from '@prismicio/client'
import * as prismicNext from '@prismicio/next'

export const getClient = (config = {}) => {
  const client = prismic.createClient('bolsafacil-ba', {
   accessToken: process.env.PRISMIC_ACCESS_TOKEN,
   fetchOptions:
     process.env.NODE_ENV === 'production'
       ? { next: { tags: ['prismic'] }, cache: 'force-cache' }
       : { next: { revalidate: 5 } },
      ...config,
  });

  prismicNext.enableAutoPreviews({ client })

  return client
}