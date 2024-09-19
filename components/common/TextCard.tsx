export const TextCard = ({ text }: { text: string }) => {
  return (
    <div className="flex justify-center p-8 bg-white border border-gray-100 shadow-md rounded-xl my-8">
      <p className="text-xl font-bold">{text}</p>
    </div>
  );
};
