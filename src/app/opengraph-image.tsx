/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const logoData = readFileSync(join(process.cwd(), "public", "parstama_logo.png"))
  const logoBase64 = logoData.toString("base64")
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
          background: "linear-gradient(135deg, #0A0A0B 0%, #1a1a1e 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <img
          src={logoDataUrl}
          alt="PARSTAMA"
          width={180}
          height={180}
          style={{ marginBottom: "32px", borderRadius: "20px" }}
        />
        <div
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: "16px",
            letterSpacing: "4px",
          }}
        >
          PARSTAMA
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "2px",
          }}
        >
          PMR SMKN 1 Singosari
        </div>
      </div>
    ),
    { ...size }
  )
}
