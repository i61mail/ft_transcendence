import Link from "next/link";
import {Button} from "./button/button";

export default function Home() {
  return (
    <main style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Home Page</h1>
      <p>
        <Link href="/about">Go to About Page</Link>
      </p>
      <Butt />
    </main>
  );
}

export function Butt() {
  return (
    <div>
      <h1>Hello</h1>
      <Button label="Click Me" />
    </div>
  )
}