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
            },
            {
                protocol: 'https',
                hostname: 'www.facebook.com'
            }
        ]
    },
    async headers(){
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // Colocar site específico que pode fazer requisições https://matriculas.fazag.edu.br
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                    { key: "Access-Control-Max-Age", value: "86400" },
                ]
            }
        ]
    }
};


export default nextConfig;
