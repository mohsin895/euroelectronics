/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    async rewrites() {
        return [
            {
                source: "/uploads/:path*",
                destination: "http://localhost/moto-empire/public/uploads/:path*",
            },
        ]
    },
}

export default nextConfig