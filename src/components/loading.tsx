export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative w-10 h-10">
        <div className="absolute w-full h-full border-4 border-muted-foreground rounded-full opacity-30" />
        <div className="absolute w-full h-full border-4 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default LoadingSpinner;
