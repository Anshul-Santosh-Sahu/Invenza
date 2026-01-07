import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground animate-fade-in">
      <div className="bg-card shadow-lg rounded-xl p-8 w-[90%] max-w-md border border-border">
        <Outlet />
      </div>
    </div>
  );
}
