import Peer from "peerjs";
import type { DataConnection } from "peerjs";

const PREFIX = "crab-";

export class Net {
  private peer: Peer;
  private conn: DataConnection | null = null;

  onReady: () => void = () => {};
  onData: (msg: unknown) => void = () => {};
  onError: (msg: string) => void = () => {};

  constructor(peer: Peer) {
    this.peer = peer;
    this.peer.on("error", (e) => this.onError(String(e)));
  }

  // Host side: claim the code as our peer ID and wait for the friend to connect.
  static host(code: string): Net {
    const peer = new Peer(PREFIX + code);
    const net = new Net(peer);
    peer.on("connection", (conn) => net.bind(conn));
    return net;
  }

  // Join side: get a random ID, then dial the host's ID (the code).
  static join(code: string): Net {
    const peer = new Peer();
    const net = new Net(peer);
    peer.on("open", () => net.bind(peer.connect(PREFIX + code)));
    return net;
  }

  // Wire up a connection once we have one (same for both sides).
  private bind(conn: DataConnection) {
    this.conn = conn;
    conn.on("open", () => this.onReady());
    conn.on("data", (d) => this.onData(d));
  }

  send(msg: unknown) {
    this.conn?.send(msg);
  }
}
