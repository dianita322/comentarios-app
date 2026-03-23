import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountForm from '@/app/account/account-form'

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <AccountForm userId={user.id} email={user.email ?? ''} />
}