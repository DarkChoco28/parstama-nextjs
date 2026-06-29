import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const logoRes = await fetch(
    new URL("../../public/parstama_logo.png", import.meta.url)
  )
  const logoBuffer = await logoRes.arrayBuffer()
  const logoBase64 = Buffer.from(logoBuffer).toString("base64")
  const logoDataUrl = `data:image/png;base64,${logoBase64}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0B",
          fontFamily: "sans-serif",
        }}
      >
        <img
          src={logoDataUrl}
          width={200}
          height={200}
          style={{ marginBottom: "24px" }}
        />
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: "12px",
          }}
        >
          PARSTAMA
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          PMR SMKN 1 Singosari
        </div>
      </div>
    ),
    { ...size }
  )
}
