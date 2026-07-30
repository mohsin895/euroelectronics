
import { FloatingButtons } from "@/components/floating-buttons"
import { AccountLayout } from "@/components/account-layout"
import { ProfileEditPanel } from "@/components/account/profile-edit-panel"
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";


export default async function ProfileEditPage() {

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <AccountLayout>
                <ProfileEditPanel />
            </AccountLayout>
            <Footer />
            <FloatingButtons />
        </div>
    )
}