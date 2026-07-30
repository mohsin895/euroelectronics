
import { FloatingButtons } from "@/components/floating-buttons"
import { AccountLayout } from "@/components/account-layout"
import { MyOrdersPanel } from "@/components/account/my-orders-panel"
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";





export default async function MyOrdersPage() {

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <AccountLayout>
                <MyOrdersPanel />
            </AccountLayout>
            <Footer />
            <FloatingButtons />
        </div>
    )
}