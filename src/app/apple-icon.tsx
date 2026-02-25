import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1f8f4a',
          color: '#ffffff',
          fontSize: 84,
          fontWeight: 800,
          fontFamily: 'Arial',
          borderRadius: 36,
        }}
      >
        Z
      </div>
    ),
    {
      ...size,
    }
  )
}
