// 'use server'

// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'

// export async function loginAdmin(formData: FormData) {
//   const email = formData.get('email')
//   const password = formData.get('password')

//   // LOGIC HARDCODE UNTUK TESTING (Ganti dengan pengecekan database nantinya)
//   if (email === 'admin@evomi.com' && password === 'admin123') {
//     // Set cookie untuk menandakan admin sudah login (berlaku 1 hari)
//     cookies().set('admin_token', 'evomi-secure-token-123', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 60 * 60 * 24, // 1 hari
//       path: '/',
//     })
    
//     redirect('/dashboard')
//   } else {
//     // Jika gagal, Anda bisa mereturn error (di sini kita lempar error sederhana)
//     throw new Error('Email atau password salah')
//   }
// }

// export async function logoutAdmin() {
//   cookies().delete('admin_token')
//   redirect('/login')
// }