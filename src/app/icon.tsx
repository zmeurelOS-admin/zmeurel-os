import { ImageResponse } from 'next/og'

export const size = {
  width: 192,
  height: 192,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(160deg,#14532d,#16a34a)',
          color: '#ffffff',
          fontSize: 88,
          fontWeight: 800,
          fontFamily: 'Arial',
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
