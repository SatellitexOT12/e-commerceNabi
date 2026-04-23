import React from 'react'

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const logoUrl = 'https://vfomcuyjibpbkistjhpd.supabase.co/storage/v1/object/public/pics/LogoMN.webp'

  const sizeMap = {
    small: {
      width: '48px',
      height: '48px',
    },
    medium: {
      width: '60px',
      height: '60px',
    },
    large: {
      width: '160px',
      height: '160px',
    },
  }

  const styles = sizeMap[size]

  return (
    <img
      src={logoUrl}
      alt="MiniNabi Logo"
      className={`logo-image ${className}`}
      style={{
        width: styles.width,
        height: styles.height,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  )
}
