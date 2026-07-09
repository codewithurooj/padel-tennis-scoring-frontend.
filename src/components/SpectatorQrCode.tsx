import { QRCodeSVG } from "qrcode.react";
import { buildSpectatorUrl } from "@/lib/spectator-url";

export default function SpectatorQrCode({ matchId }: { matchId: string }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-md bg-white p-1"
      aria-label="Scan to open the spectator view for this match"
    >
      <QRCodeSVG
        value={buildSpectatorUrl(matchId)}
        size={44}
        bgColor="#FFFFFF"
        fgColor="#060f0d"
        level="M"
        title="Scan to watch this match"
      />
    </div>
  );
}
