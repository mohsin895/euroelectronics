
import { FloatingButtons } from "@/components/floating-buttons"
import { AccountLayout } from "@/components/account-layout"
import { ChangePasswordPanel } from "@/components/account/change-password-panel"
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";



export default async function ChangePasswordPage() {

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <AccountLayout>
                <ChangePasswordPanel />
            </AccountLayout>
            <Footer />
            <FloatingButtons />
        </div>
    )
}