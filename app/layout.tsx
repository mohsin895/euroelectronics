import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const notoBengali = Noto_Sans_Bengali({
    variable: "--font-bengali",
    subsets: ["bengali"],
    weight: ["400", "500", "600", "700", "800"],
});

// Change this if needed
const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://motoempirebd.com";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default:
            "MOTO EMPIRE | এক ছাদের নিচে বাইকারদের প্রয়োজনীয় সব প্রোডাক্ট",
        template: "%s | MOTO EMPIRE",
    },

    description:
        "এক ছাদের নিচে বাইকারদের প্রয়োজনীয় সব প্রোডাক্ট। বাইক এক্সেসরিজের নির্ভরযোগ্য ঠিকানা MOTO EMPIRE।",

    keywords: [
        "Moto Empire",
        "Motorcycle Accessories",
        "Helmet",
        "Bike Cover",
        "Intercom",
        "Riding Jacket",
        "Bike Gloves",
        "Bangladesh",
    ],

    authors: [{ name: "Moto Empire" }],
    creator: "Moto Empire",
    publisher: "Moto Empire",

    verification: {
        google: "Z2kWgol82v03EajdDaUggrPjLUYBuC9A_24I8w2fY0k",
    },

    alternates: {
        canonical: "/",
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },

    openGraph: {
        type: "website",
        locale: "bn_BD",
        url: SITE_URL,
        title:
            "MOTO EMPIRE | এক ছাদের নিচে বাইকারদের প্রয়োজনীয় সব প্রোডাক্ট",
        description:
            "এক ছাদের নিচে বাইকারদের প্রয়োজনীয় সব প্রোডাক্ট। বাইক এক্সেসরিজের নির্ভরযোগ্য ঠিকানা।",
        siteName: "Moto Empire",
        images: [
            {
                url: `${SITE_URL}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: "Moto Empire",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "Moto Empire",
        description: "এক ছাদের নিচে বাইকারদের প্রয়োজনীয় সব প্রোডাক্ট।",
        images: [`${SITE_URL}/og-image.jpg`],
    },

    icons: {
        icon: "/logo.png",
        apple: "/apple-icon.png",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Moto Empire",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
            "https://www.facebook.com/bdmotoempire",
            "https://www.youtube.com/@bdmotoempire",
            "https://www.instagram.com/motoempirebd",
            "https://www.tiktok.com/@motoempirebd",
        ],
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Moto Empire",
        url: SITE_URL,
        potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <html
            lang="bn"
            className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable}`}
        >
        <head>
            {/* Google Search Console */}
            <meta
                name="google-site-verification"
                content="Z2kWgol82v03EajdDaUggrPjLUYBuC9A_24I8w2fY0k"
            />

            {/* Google Tag Manager */}
            <Script id="gtm" strategy="afterInteractive">
                {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TM98ZZJ6');
          `}
            </Script>

            {/* Meta Pixel Code */}
            <Script id="meta-pixel" strategy="afterInteractive">
                {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '26002210762810486');
            fbq('track', 'PageView');
          `}
            </Script>

            {/* Organization Schema */}
            <Script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />

            {/* Website Schema */}
            <Script
                id="website-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteSchema),
                }}
            />
        </head>

        <body className="font-sans antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
            <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-TM98ZZJ6"
                height="0"
                width="0"
                style={{
                    display: "none",
                    visibility: "hidden",
                }}
            />
        </noscript>

        {/* Meta Pixel Code (noscript) */}
        <noscript>
            <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src="https://www.facebook.com/tr?id=26002210762810486&ev=PageView&noscript=1"
                alt=""
            />
        </noscript>

        <Providers>{children}</Providers>

        {process.env.NODE_ENV === "production" && <Analytics />}
        </body>
        </html>
    );
}