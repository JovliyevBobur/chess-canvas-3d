import { ChessGame } from '@/components/chess/ChessGame';

const Index = () => {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="relative z-10 w-full h-screen">
        <ChessGame />
      </div>
    </main>
  );
};

export default Index;
