import Image from "next/image";

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <Image src="/loading.gif" width={140} height={140} alt="Đang tải..." priority />
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      </div>
    </div>
  );
};

export default LoadingPage;
