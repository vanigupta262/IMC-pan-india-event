import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Users, Trophy, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Trade Simulation</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Build Your Trading Strategy
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Write C++ trading algorithms, test them in real-time simulations, and compete with others in managed lobbies.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Start Coding <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Code2 className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Code Editor</CardTitle>
              <CardDescription>
                Write and test C++ trading strategies with Monaco Editor integration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Lobby System</CardTitle>
              <CardDescription>
                Automatic distribution into lobbies of 10 users for fair competition
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="w-8 h-8 text-yellow-600 mb-2" />
              <CardTitle>Live Competitions</CardTitle>
              <CardDescription>
                Real-time strategy execution with swap functionality and history tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Start */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Create your account and sign in</li>
              <li>Write your C++ trading strategy in the code editor</li>
              <li>Submit your code to enter the competition</li>
              <li>Get automatically assigned to a lobby</li>
              <li>Watch your strategy compete in real-time!</li>
            </ol>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2026 Trade Simulation. Built with Next.js and C++ backend.
          </p>
        </div>
      </footer>
    </div>
  );
}
