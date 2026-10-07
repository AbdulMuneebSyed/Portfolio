"use client";

import { useEffect, useRef, useState } from "react";
import { MiniButton, MiniHeader, useFocusRoot, useStoredNumber } from "./shared";
import type { MiniAppProps } from "./registry";

const W = 560;
const H = 400;
const ROWS = 5;
const COLS = 9;
const BRICK_H = 16;
const BRICK_GAP = 6;
const BRICK_TOP = 40;
const PADDLE_W = 84;
const PADDLE_H = 10;
const BALL_R = 7;
const ROW_COLORS = ["#ff453a", "#ff9f0a", "#ffd60a", "#30d158", "#0a84ff"];

type Status = "ready" | "playing" | "won" | "lost";

interface World {
  paddle: number;
  ball: { x: number; y: number; vx: number; vy: number };
  bricks: boolean[];
}

const brickW = (W - BRICK_GAP * (COLS + 1)) / COLS;
const freshWorld = (): World => ({
  paddle: W / 2 - PADDLE_W / 2,
  ball: { x: W / 2, y: H - 40, vx: 3.2, vy: -3.6 },
  bricks: Array(ROWS * COLS).fill(true),
});

export function Breakout({ preview }: MiniAppProps) {
  const root = useFocusRoot<HTMLDivElement>(preview);
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(freshWorld());
  const keys = useRef({ left: false, right: false });
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const livesLeft = useRef(3);
  const [best, setBest] = useStoredNumber("muneebos-breakout-best");

  const draw = () => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const { paddle, ball, bricks } = world.current;
    ctx.clearRect(0, 0, W, H);
    bricks.forEach((alive, i) => {
      if (!alive) return;
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      ctx.fillStyle = ROW_COLORS[r];
      ctx.beginPath();
      ctx.roundRect(BRICK_GAP + c * (brickW + BRICK_GAP), BRICK_TOP + r * (BRICK_H + BRICK_GAP), brickW, BRICK_H, 4);
      ctx.fill();
    });
    ctx.fillStyle = "#f2f2f7";
    ctx.beginPath();
    ctx.roundRect(paddle, H - 24, PADDLE_W, PADDLE_H, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    if (preview) world.current.bricks = world.current.bricks.map((_, i) => i % 7 !== 3 && i > 4);
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game loop, only while playing.
  useEffect(() => {
    if (status !== "playing") return;
    let frame = 0;
    const tick = () => {
      const w = world.current;
      const { ball } = w;
      if (keys.current.left) w.paddle -= 7;
      if (keys.current.right) w.paddle += 7;
      w.paddle = Math.max(0, Math.min(W - PADDLE_W, w.paddle));
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x < BALL_R || ball.x > W - BALL_R) ball.vx *= -1;
      if (ball.y < BALL_R) ball.vy = Math.abs(ball.vy);
      // Paddle: the bounce angle depends on where the ball lands.
      if (ball.vy > 0 && ball.y + BALL_R >= H - 24 && ball.y < H - 14 && ball.x > w.paddle - BALL_R && ball.x < w.paddle + PADDLE_W + BALL_R) {
        const hit = (ball.x - (w.paddle + PADDLE_W / 2)) / (PADDLE_W / 2);
        const speed = Math.hypot(ball.vx, ball.vy);
        ball.vx = speed * hit * 0.8;
        ball.vy = -Math.sqrt(Math.max(speed ** 2 - ball.vx ** 2, 4));
      }
      for (let i = 0; i < w.bricks.length; i++) {
        if (!w.bricks[i]) continue;
        const bx = BRICK_GAP + (i % COLS) * (brickW + BRICK_GAP);
        const by = BRICK_TOP + Math.floor(i / COLS) * (BRICK_H + BRICK_GAP);
        if (ball.x + BALL_R > bx && ball.x - BALL_R < bx + brickW && ball.y + BALL_R > by && ball.y - BALL_R < by + BRICK_H) {
          w.bricks[i] = false;
          ball.vy *= -1;
          ball.vx *= 1.01;
          ball.vy *= 1.01;
          setScore((s) => s + (ROWS - Math.floor(i / COLS)) * 10);
          break;
        }
      }
      if (!w.bricks.some(Boolean)) {
        setStatus("won");
        draw();
        return;
      }
      if (ball.y > H + BALL_R) {
        livesLeft.current -= 1;
        setLives(livesLeft.current);
        setStatus(livesLeft.current <= 0 ? "lost" : "ready");
        w.ball = { x: w.paddle + PADDLE_W / 2, y: H - 40, vx: 3.2, vy: -3.6 };
        draw();
        return;
      }
      draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (score > best) setBest(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const start = () => {
    if (status === "won" || status === "lost") {
      world.current = freshWorld();
      livesLeft.current = 3;
      setScore(0);
      setLives(3);
    }
    setStatus("playing");
    root.current?.focus();
  };

  const setKey = (key: string, down: boolean) => {
    if (key === "ArrowLeft" || key === "a") keys.current.left = down;
    else if (key === "ArrowRight" || key === "d") keys.current.right = down;
    else return false;
    return true;
  };

  return (
    <div
      ref={root}
      tabIndex={0}
      className="mini-app"
      aria-label="Breakout. Move with the mouse or arrow keys; Space to launch."
      onKeyDown={(e) => {
        if (e.key === " " && status !== "playing") {
          e.preventDefault();
          start();
        } else if (setKey(e.key, true)) e.preventDefault();
      }}
      onKeyUp={(e) => setKey(e.key, false)}
    >
      <MiniHeader
        title="Breakout"
        stats={[
          { label: "Score", value: score },
          { label: "Lives", value: "●".repeat(Math.max(lives, 0)) || "–" },
          { label: "Best", value: Math.max(best, score) },
        ]}
      />
      <div className="breakout-stage">
        <canvas
          ref={canvas}
          width={W}
          height={H}
          onPointerMove={(e) => {
            if (preview) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * W;
            world.current.paddle = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
            if (status !== "playing") draw();
          }}
          onClick={() => status !== "playing" && !preview && start()}
        />
        {status !== "playing" && !preview && (
          <div className="mini-overlay">
            <strong>
              {status === "won" ? "You cleared the wall!" : status === "lost" ? "Game over" : lives < 3 ? "Ball lost" : "Breakout"}
            </strong>
            <MiniButton primary onClick={start}>
              {status === "ready" ? (lives < 3 ? "Continue" : "Start") : "Play again"}
            </MiniButton>
            <small>Mouse or ← → to move · Space to launch</small>
          </div>
        )}
      </div>
    </div>
  );
}
