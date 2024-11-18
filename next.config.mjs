import { hostname } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos'
            },
            {
                protocol: 'https',
                hostname: 'images.prismic.io'
            }
        ]
    }

};


export default nextConfig;
