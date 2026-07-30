import { FloatingButtons } from "@/components/floating-buttons"
import { AccountLayout } from "@/components/account-layout"
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";


const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""


export default async function Account() {


    return (
        <div className="min-h-screen bg-background">

            <Header />
            <AccountLayout />

            <Footer />
            <FloatingButtons />
        </div>
    )
}