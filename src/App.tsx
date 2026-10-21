
import { Button } from "@/components/ui/button"

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <h1 className="text-4xl font-bold text-foreground">
        Jungle Gaming 🚀
      </h1>

      <p className="text-muted-foreground">
        NFT Marketplace — Frontend Challenge
      </p>

      <Button type="button">
        Explore NFTs
      </Button>
    </main>
  )
}

export default App
