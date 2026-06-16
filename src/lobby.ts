import { Net } from "./Net";

export type Role = "host" | "join";

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function showLobby(): Promise<{ net: Net; role: Role }> {
  const lobby = document.getElementById("lobby")!;
  const hostBtn = document.getElementById("host-btn") as HTMLButtonElement;
  const joinBtn = document.getElementById("join-btn") as HTMLButtonElement;
  const joinInput = document.getElementById("join-input") as HTMLInputElement;
  const hostInfo = document.getElementById("host-info")!;
  const status = document.getElementById("status")!;

  return new Promise((resolve) => {
    hostBtn.onclick = () => {
      const code = makeCode();
      hostInfo.textContent = code;
      status.textContent = "Waiting for opponent…";
      const net = Net.host(code);
      net.onError = (e) => {
        status.textContent = "Error: " + e;
      };
      net.onReady = () => {
        lobby.classList.add("hidden");
        resolve({ net, role: "host" });
      };
    };

    joinBtn.onclick = () => {
      const code = joinInput.value.trim().toUpperCase();
      if (!code) return;
      status.textContent = "Connecting…";
      const net = Net.join(code);
      net.onError = (e) => {
        status.textContent = "Error: " + e;
      };
      net.onReady = () => {
        lobby.classList.add("hidden");
        resolve({ net, role: "join" });
      };
    };
  });
}
