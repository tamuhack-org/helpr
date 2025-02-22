export const SettingsBlockTemplate = ({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between mt-4 gap-8 border-b-2 border-gray-200 pb-4">
      <div className="mt-4 md:w-1/2">
        <p className="text-lg font-semibold">{title}</p>
        <p className="opacity-80 md:w-1/2">{desc}</p>
      </div>
      {children}
    </div>
  );
};

export default SettingsBlockTemplate;
