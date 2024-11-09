import { auth } from "@/auth";
import { redirect } from "next/navigation"

export default async function Page() {
    //If logged in go to member.eartho.io
    const session = await auth();

    if (session) {
        redirect('https://member.eartho.io')
        return
    }
    
    //else
    redirect('/auth/login')
    return <></>
}