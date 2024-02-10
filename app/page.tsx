import Editor from "@/components/editor/editor";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <Editor />
      </div>
    </main>
  );
}
