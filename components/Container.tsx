export default function Container({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 flex flex-col sm:grid sm:grid-cols-4 grid-rows-5 md:h-screen gap-8 sm:gap-2 lg:gap-8 ">
      {children}
    </div>
  );
}
