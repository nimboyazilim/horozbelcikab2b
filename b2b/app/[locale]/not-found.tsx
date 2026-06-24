import Image from "next/image";
import Link from "next/link";
import notFoundImage from '@/public/assets/horoz-electric-logo-2.png';

export default function NotFound() {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem'
    }}>
        <Image src={notFoundImage} alt="horoz electric logo" width={162} height={50} />
        <h1>404</h1>
        <h2>Page not found</h2>
        <Link href="/" style={{
            textDecoration: 'none',
            color: 'blue',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            border: '1px solid blue',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            cursor: 'pointer'
        }}>Go to home</Link>
    </div>
}
